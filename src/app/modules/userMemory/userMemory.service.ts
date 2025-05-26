import { UserMemory } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// create user memory
const createUserMemory = async (payload: UserMemory) => {
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

  const tag = await prisma.tags.findUnique({
    where: { id: payload.tagId },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  const memory = await prisma.userMemory.create({
    data: {
      ...payload,
      contacts: {
        create: payload.contactIds.map((contactId) => ({
          contact: {
            connect: { id: contactId },
          },
        })),
      },
    },
    include: {
      tag: true,
      contacts: true,
    },
  });

  return memory;
};

// update user memory
const updateUserMemory = async (id: string, payload: Partial<UserMemory>) => {
  // 1. Check if memory exists
  const existingMemory = await prisma.userMemory.findUnique({
    where: { id },
    include: { contacts: true },
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
      status: payload.status,
      files: payload.files,
      tagId: payload.tagId,
      userId: payload.userId,
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

  return updatedMemory;
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
const getAllUserMemories = async (filters: GetUserMemoriesFilter = {}) => {
  const {
    userId,
    tagId,
    contactId,
    hasMedia,
    startDate,
    endDate,
    searchQuery,
  } = filters;

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

  return memories;
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

  return userMemory;
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
  getUserMemoryById,
  deleteUserMemory,
};

export default userMemoryService;
