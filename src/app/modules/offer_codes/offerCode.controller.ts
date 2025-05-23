import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import offerCodeService from "./offerCode.service";

// create offer code
const createOfferCode = catchAsync(async (req, res) => {
  console.log("req.body ", req.body);
  const offerCode = await offerCodeService.createOfferCode(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer code created successfully",
    data: offerCode,
  });
});

// get All Offer Codes
const getAllOfferCodes = catchAsync(async (req, res) => {
  const offerCodes = await offerCodeService.getAllOfferCodes();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer codes retrieved successfully",
    data: offerCodes,
  });
});

// get single offer code
const getSingleOfferCode = catchAsync(async (req, res) => {
  const { id } = req.params;
  const offerCode = await offerCodeService.getOfferCodeById(id);

  if (!offerCode) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Offer code not found",
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer code retrieved successfully",
    data: offerCode,
  });
});

// update offer code
const updateOfferCode = catchAsync(async (req, res) => {
  const { id } = req.params;
  const offerCode = await offerCodeService.updateOfferCode(id, req.body);
  if (!offerCode) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Offer code not found",
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer code updated successfully",
    data: offerCode,
  });
}
);

const offerCodeController = {
  createOfferCode,
  getAllOfferCodes,
  getSingleOfferCode,
  updateOfferCode,
};

export default offerCodeController;
