import { ContactList } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// contact list create
const contactListCreate = async (payload: ContactList) => {
  // user find
  const findUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!findUser) {
    throw new ApiError(404, "User not found!");
  }

  const result = await prisma.contactList.create({
    data: payload,
  });

  return result;
};

// contact list update
const contactListUpdate = async (id: string, payload: Partial<ContactList>) => {
  // check contact exists
  const isExist = await prisma.contactList.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(404, "Contact not found!");
  }

  const result = await prisma.contactList.update({
    where: { id },
    data: payload,
  });

  return result;
};

// find all contact list by userId
const getContactListsByUserId = async (userId: string) => {
  // check if user exists
  const userExists = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userExists) {
    throw new ApiError(404, "User not found!");
  }

  // fetch all contact lists by userId
  const contactLists = await prisma.contactList.findMany({
    where: {
      userId,
    },
  });

  return contactLists;
};

// find all contact list
const getAllContactList = async () => {
  const contactLists = await prisma.contactList.findMany({});

  return contactLists;
};

const contactListService = {
  contactListCreate,
  contactListUpdate,
  getContactListsByUserId,
  getAllContactList,
};

export default contactListService;
