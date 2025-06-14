import { Prisma, UserMemory } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { dateInput, dateOutput } from "../../../utils/date";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";

// create user memory
const createUserMemory = async (payload: UserMemory) => {
  // Step 1: Validate contactIds
  const existingContacts = await prisma.contactList.findMany({
    where: {
      id: { in: payload.contactIds },
    },
    select: { id: true },
  });

  const existingContactIds = existingContacts.map((c) => c.id);

  if (existingContactIds.length !== payload.contactIds.length) {
    throw new ApiError(
      400,
      "One or more contactIds are invalid or do not exist"
    );
  }

  // Step 3: Check if tag exists
  const tag = await prisma.tags.findUnique({
    where: { id: payload.tagId },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  // Step 4: Create memory
  const memory = await prisma.userMemory.create({
    data: {
      content: payload.content,
      files: payload.files,
      userId: payload.userId,
      tagId: payload.tagId,
      publish: dateInput(payload.publish),
      contactListId: payload.contactListId,
      isPublish: payload.isPublish ?? true,
      contacts: {
        create: payload.contactIds.map((contactId) => ({
          contact: {
            connect: { id: contactId },
          },
        })),
      },
      songList: payload.songList,
    },
    include: {
      tag: true,
      contacts: true,
    },
  });

  const formattedMemory = {
    ...memory,
    publish: dateOutput(memory.publish),
  };

  return formattedMemory;
};

// update user memory
const updateUserMemory = async (id: string, payload: Partial<UserMemory>) => {
  // 1. Check if memory exists
  const existingMemory = await prisma.userMemory.findUnique({
    where: { id },
    include: { contacts: true, tag: true },
  });

  if (!existingMemory) {
    throw new ApiError(404, "User memory not found");
  }
  if (payload.userId) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) throw new ApiError(404, "User not found");
  }

  // 3. Validate tag if provided
  if (payload.tagId) {
    const tag = await prisma.tags.findUnique({
      where: { id: payload.tagId },
    });
    if (!tag) throw new ApiError(404, "Tag not found");
  }

  // 4. Validate and prepare contact list if provided
  if (payload.contactIds && payload.contactIds.length > 0) {
    const existingContacts = await prisma.contactList.findMany({
      where: { id: { in: payload.contactIds } },
      select: { id: true },
    });

    const existingContactIds = existingContacts.map((c) => c.id);

    if (existingContactIds.length !== payload.contactIds.length) {
      throw new ApiError(400, "One or more contactIds are invalid");
    }

    // Remove old relations
    await prisma.userMemoryContact.deleteMany({
      where: { userMemoryId: id },
    });
  }

  // 5. Update the memory
  const updatedMemory = await prisma.userMemory.update({
    where: { id },
    data: {
      content: payload.content,
      isPublish: payload.isPublish,
      files: payload.files,
      tagId: payload.tagId,
      userId: payload.userId,
      ...(payload?.publish && { publish: dateInput(payload?.publish) }),
      contacts: payload.contactIds
        ? {
            create: payload.contactIds.map((contactId) => ({
              contact: {
                connect: { id: contactId },
              },
            })),
          }
        : undefined,
    },
    include: {
      tag: true,
      contacts: true,
    },
  });

  const formatData = {
    ...updatedMemory,
    publish: dateOutput(updatedMemory.publish),
  };

  return formatData;
};

// find all memory with filter & search query
type GetUserMemoriesFilter = {
  userId?: string;
  tagId?: string;
  contactId?: string;
  hasMedia?: boolean;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
};
// get all user memories with filters
const getUserMemoriesAll = async (
  id: string, filters: GetUserMemoriesFilter = {}
) => {
  const {
    userId,
    tagId,
    contactId,
    hasMedia,
    startDate,
    endDate,
    searchQuery,
  } = filters;

  // find user id
  const userData = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      userImage: true,
      userId: true,
      fullName: true,
      ContactList: true,
    }
  });

  const memories = await prisma.userMemory.findMany({
    where: {
      ...(userId && { userId }),
      ...(tagId && { tagId }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
      ...(hasMedia !== undefined && {
        mediaUrl: hasMedia ? { not: null } : null,
      }),
      ...(contactId && {
        contacts: {
          some: {
            contactId: contactId,
          },
        },
      }),
      ...(searchQuery && {
        OR: [
          { content: { contains: searchQuery, mode: "insensitive" } },
          // { description: { contains: searchQuery, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      tag: true,
      user: {
        select: {
          userImage: true,
          fullName: true,
          userId: true,
          id: true
        }
      },
      contacts: {
        include: {
          contact: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formatData = memories.map((memory) => ({
    ...memory,
    publish: dateOutput(memory.publish),
  }));

  return { userData, memories: formatData };
};

const getAllUserMemories = async (
  id: string,
  filters: GetUserMemoriesFilter = {},
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const {
    userId,
    tagId,
    contactId,
    hasMedia,
    startDate,
    endDate,
    searchQuery,
  } = filters;

  // find user data
  const userData = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      userImage: true,
      userId: true,
      fullName: true,
      ContactList: true,
    },
  });

  // build where condition
  const whereConditions: Prisma.UserMemoryWhereInput = {
    ...(userId && { userId }),
    ...(tagId && { tagId }),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
      : {}),
    ...(hasMedia !== undefined && {
      mediaUrl: hasMedia ? { not: null } : null,
    }),
    ...(contactId && {
      contacts: {
        some: {
          contactId: contactId,
        },
      },
    }),
    ...(searchQuery && {
      OR: [
        {
          content: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  // get paginated data
  const memories = await prisma.userMemory.findMany({
    where: whereConditions,
    include: {
      tag: true,
      user: {
        select: {
          userImage: true,
          fullName: true,
          userId: true,
          id: true,
        },
      },
      contacts: {
        include: {
          contact: true,
        },
      },
    },
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    skip,
    take: limit,
  });

  // count total for pagination
  const total = await prisma.userMemory.count({
    where: whereConditions,
  });

  // format memory data
  const formatData = memories.map((memory) => ({
    ...memory,
    publish: dateOutput(memory.publish),
  }));

  return {
    meta: {
      page,
      limit,
      total,
    },
    userData,
    memories: formatData,
  };
};

// get user memory by userId
const getUserMemoryById = async (id: string) => {
  const userMemory = await prisma.userMemory.findUnique({
    where: { id },
    include: {
      tag: true,
      contacts: {
        include: {
          contact: true,
        },
      },
    },
  });

  if (!userMemory) {
    throw new ApiError(404, "User memory not found");
  }

  const formatData = {
    ...userMemory,
    publish: dateOutput(userMemory.publish)
  }

  return formatData;
};

// delete user memory by id
const deleteUserMemory = async (id: string) => {
  // Check if memory exists
  const existingMemory = await prisma.userMemory.findUnique({
    where: { id },
  });

  if (!existingMemory) {
    throw new ApiError(404, "User memory not found");
  }

  // Remove old relations
  await prisma.userMemoryContact.deleteMany({
    where: { userMemoryId: id },
  });

  const deletedMemory = await prisma.userMemory.delete({
    where: { id },
  });

  return deletedMemory;
};

const userMemoryService = {
  createUserMemory,
  updateUserMemory,
  getAllUserMemories,
  getUserMemoriesAll,
  getUserMemoryById,
  deleteUserMemory,
};

export default userMemoryService;
