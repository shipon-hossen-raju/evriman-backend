import { ContactList } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";

// contact list create
const contactListCreate = async (payload: ContactList) => {
  // user find
  const findUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      contactLimit: true,
      id: true,
      email: true,
      ContactList: true,
      _count: {
        select: {
          ContactList: true
        }
      }
    },
  });

  if (!findUser) {
    throw new ApiError(404, "User not found!");
  }

  if (findUser.contactLimit <= findUser._count.ContactList) {
    throw new ApiError(httpStatus.ALREADY_REPORTED, "Your contact limit has expired!")
  }

  const result = await prisma.contactList.create({
    data: payload,
  });

  return findUser;
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

// delete contact list
const deleteContactList = async (id: string) => {
  // check contact exists
  const isExist = await prisma.contactList.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });
  console.log("isExist ", isExist);
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contact not found!");
  }

  // Delete related UserMemoryContact entries first
  await prisma.userMemoryContact.deleteMany({
    where: {
      contactId: id,
    },
  });

  const result = await prisma.contactList.delete({
    where: { id },
    select: {
      id: true,
    },
  });

  return result;
};

const contactListService = {
  contactListCreate,
  contactListUpdate,
  getContactListsByUserId,
  getAllContactList,
  deleteContactList,
};

export default contactListService;
