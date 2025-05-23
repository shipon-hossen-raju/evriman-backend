import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import contactListService from "./contactList.service";



const contactListCreate = catchAsync(async (req, res) => {
   const result = await contactListService.contactListCreate(req.body);

   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Contact List Created Successfully",
      data: result,
   })
})


const contactListController = {
   contactListCreate
}

export default contactListController
