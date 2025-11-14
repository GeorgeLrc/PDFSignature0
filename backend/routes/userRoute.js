const express = require("express");
const {
  logout,
  loginUser,
  sendResetOtp,
  resetPassword,
  isAuthenticated,
  getCurrentUser,
  getOtherUsersList,
} = require("../controllers/userController");
const userAuth = require("../middleware/userAuth");
const {
  uploadTemplate,
  getAllTemplates,
  getAllTemplatesByUser,
  deleteTemplate,
  renameTemplateTitle,
  getTemplateByTemplateId,
  getAllPublicTemplates,
  getRecentTemplates,
  generateAndUploadPDF,
} = require("../controllers/templateController");
const {
  createNewRequest,
  getRequestsByCurrentUser,
  getRequestsRecievedFromOtherUsers,
  getRequestById,
  getAllRequests,
  signedByTheCurrentUser,
  deleteRequest,
} = require("../controllers/requestController");
const uploadPdf = require("../middleware/multerPdf");
const { getUsersList } = require("../controllers/adminController");

const userRouter = express.Router();

//user login
userRouter.post("/login", loginUser);

//user logout
userRouter.post("/logout", logout);

//check if authenticated or not
userRouter.get("/is-auth", userAuth, isAuthenticated);

//send reset password otp
userRouter.post("/send-reset-otp", sendResetOtp);

//reset password
userRouter.post("/reset-password", resetPassword);

userRouter.get("/user-data", userAuth, getCurrentUser);

//upload template including pdf file
userRouter.post(
  "/upload-template",
  uploadPdf.single("pdf"),
  userAuth,
  uploadTemplate
);

userRouter.get("/templates", userAuth, getAllTemplatesByUser);

userRouter.post("/rename-template", userAuth, renameTemplateTitle);

userRouter.post("/delete-template", userAuth, deleteTemplate);

userRouter.get("/templates/:id", userAuth, getTemplateByTemplateId);

userRouter.post("/create-request", userAuth, createNewRequest);

userRouter.get("/users", userAuth, getOtherUsersList);

userRouter.get("/my-requests", userAuth, getRequestsByCurrentUser);

userRouter.get(
  "/requests-by-others",
  userAuth,
  getRequestsRecievedFromOtherUsers
);

userRouter.get("/public-templates", userAuth, getAllPublicTemplates);

userRouter.get("/requests/:id", getRequestById);

userRouter.get("/requests", getAllRequests);

userRouter.get("/recent-templates", userAuth, getRecentTemplates);

userRouter.post(
  "/signed-by-user",
  uploadPdf.single("pdf"),
  userAuth,
  signedByTheCurrentUser
);

userRouter.post("/generate-pdf", userAuth, generateAndUploadPDF);

userRouter.post('/delete-request', userAuth, deleteRequest);

module.exports = userRouter;
