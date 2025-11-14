const requestModel = require("../models/requestModel");

//create request
const createNewRequest = async (req, res) => {
  try {
    const {
      userId,
      recipients,
      emailSubject,
      emailMessage,
      templateId,
      title,
    } = req.body;

    if (
      !userId ||
      !recipients ||
      !emailSubject ||
      !emailMessage ||
      !templateId ||
      !title
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validate recipients
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipients must be a non-empty array",
      });
    }

    const requestData = {
      senderId: userId,
      recipients,
      emailSubject,
      emailMessage,
      templateId,
      title,
    };

    const newRequest = new requestModel(requestData);
    await newRequest.save();

    //send email to notify the request

    return res.json({ success: true, message: "New Request Created" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//requests sent by the currentUser (My requests)
const getRequestsByCurrentUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const requests = await requestModel
      .find({ senderId: userId })
      .populate("recipients.userId", "first_name last_name email");

    return res.json({ success: true, requests });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//requests recieved from other users (Requests by others)
const getRequestsRecievedFromOtherUsers = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    // Find requests where the current user is in the recipients array
    const requests = await requestModel
      .find({ recipients: { $elemMatch: { userId, signed: false } } })
      .populate("senderId", "first_name last_name email") // Get sender details
      .populate("recipients.userId", "first_name last_name email"); // Get recipient details

    return res.json({ success: true, requests });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//get request by request id
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ success: false, message: "Request ID is required" });
    }

    // Fetch the request by ID and populate the template field
    const request = await requestModel
      .findById(id)
      .populate("templateId")
      .populate("pdfVersions.signedBy.userId");
    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }

    return res.json({ success: true, request });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//get all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await requestModel
      .find()
      .populate("senderId", "first_name last_name email") // Get sender details
      .populate("recipients.userId", "first_name last_name email"); // Get recipient details

    return res.json({ success: true, requests });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//signed by the user and then save it to the pdf version
const signedByTheCurrentUser = async (req, res) => {
  try {
    const { userId, requestId } = req.body;

    if (!userId || !requestId) {
      return res.json({
        success: false,
        message: "User ID and request Id are required",
      });
    }

    console.log("Received File:", req.file);

    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    // Find the request document
    const request = await requestModel.findById(requestId);
    if (!request) {
      return res.json({
        success: false,
        message: "No request found with this ID",
      });
    }

    // Check if the user is a recipient
    const recipientIndex = request.recipients.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (recipientIndex === -1) {
      return res.json({
        success: false,
        message: "User is not a recipient of this request",
      });
    }

    // Check if the user has already signed
    if (request.recipients[recipientIndex].signed) {
      return res.json({
        success: false,
        message: "User has already signed this document",
      });
    }

    // Determine the new version number
    const version = request.pdfVersions.length + 1;

    // Add the new signed version to pdfVersions[]
    request.pdfVersions.push({
      version,
      filePath: req.file.filename,
      signedBy: {
        userId: userId,
        signedAt: new Date(),
      },
    });

    // Mark user as signed in recipients array
    request.recipients[recipientIndex].signed = true;

    // Check if all recipients have signed
    const allSigned = request.recipients.every((r) => r.signed);
    // Change status if all signed
    if (allSigned) {
      request.status = "approved";
    }

    // Save the updated request document
    await request.save();

    return res.json({
      success: true,
      message: "Signature saved successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// delete a request (only sender can delete)
const deleteRequest = async (req, res) => {
  try {
    const { requestId, userId } = req.body;
    if (!requestId || !userId) {
      return res.json({ success: false, message: 'requestId and userId required' });
    }

    const request = await requestModel.findById(requestId);
    if (!request) return res.json({ success: false, message: 'Request not found' });

    if (request.senderId.toString() !== userId) {
      return res.json({ success: false, message: 'Not authorized to delete this request' });
    }

    await requestModel.findByIdAndDelete(requestId);
    return res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  createNewRequest,
  getRequestsByCurrentUser,
  getRequestsRecievedFromOtherUsers,
  getRequestById,
  getAllRequests,
  signedByTheCurrentUser,
  deleteRequest,
};
