import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import dynamicUserDataService from "./dynamicUserData.service";

// create dynamic user data
const createDynamicUserData = catchAsync(async (req, res) => {
   console.log("req.body", req.body);
   
  const newDynamicUserData = await dynamicUserDataService.createDynamicUserData(
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dynamic User Data created successfully",
    data: newDynamicUserData,
  });
});


const dynamicUserDataController = {
   createDynamicUserData,
};
   
export default dynamicUserDataController;