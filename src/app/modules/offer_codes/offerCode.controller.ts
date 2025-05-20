import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse";
import offerCodeService from "./offerCode.service";



const createOfferCode = catchAsync(async (req, res) => {
   console.log("req.body ", req.body);
   const offerCode = await offerCodeService.createOfferCode(req.body);
   
   sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Offer code created successfully",
      data: offerCode
   })
})

const offerCodeController = {
   createOfferCode
}

export default offerCodeController;