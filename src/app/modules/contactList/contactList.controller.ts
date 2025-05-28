import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import contactListService from "./contactList.service";

// contact list create
const contactListCreate = catchAsync(async (req, res) => {
  const result = await contactListService.contactListCreate(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Contact List Created Successfully",
    data: result,
  });
});

// contact list find by userId
const contactListFindByUserId = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await contactListService.getContactListsByUserId(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact list retrieved successfully",
    data: result,
  });
});

// get all data
const getAllContactList = catchAsync(async (req, res) => {
  const result = await contactListService.getAllContactList();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact list retrieved successfully",
    data: result,
  });
});

// contact list update
const updateContactList = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await contactListService.contactListUpdate(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact list updated successfully",
    data: result,
  });
});

// contact list update
const deleteContactList = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await contactListService.deleteContactList(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact list deleted successfully",
    data: result,
  });
})

const contactListController = {
  contactListCreate,
  contactListFindByUserId,
  getAllContactList,
  updateContactList,
  deleteContactList,
};

export default contactListController;
