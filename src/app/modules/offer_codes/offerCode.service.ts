import { OfferCode } from "@prisma/client"
import prisma from "../../../shared/prisma";

const createOfferCode = async (payload: OfferCode) => { 
   const result = await prisma.offerCode.create({
      data: payload
  })

   return result;
 }

const offerCodeService = {
  createOfferCode
}

export default offerCodeService;
