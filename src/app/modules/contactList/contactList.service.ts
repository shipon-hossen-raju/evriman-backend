import { ContactList } from "@prisma/client"
import prisma from "../../../shared/prisma"

const contactListCreate = async (payload: ContactList) => { 
   const result = await prisma.contactList.create({
    data: payload,
   })

   return result
}

const contactListService = {
  contactListCreate
}

export default contactListService

