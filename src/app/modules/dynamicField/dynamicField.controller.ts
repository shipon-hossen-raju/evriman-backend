import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse";
import dynamicFieldService from "./dynamicField.service";


const createDynamicField = catchAsync(async (req, res) => {
   console.log("controller -> ", req.body);

   const result = await dynamicFieldService.createDynamicField(req.body);

   sendResponse(res, {
       statusCode: 200,
       success: true,
       message: "Dynamic field created successfully",
       data: result,
   })
})

const dynamicFieldController = {
   createDynamicField
}

export default dynamicFieldController