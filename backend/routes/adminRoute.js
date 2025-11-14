const express = require("express");
const upload = require("../middleware/multer");
const {
  addNewUser,
  loginAdmin,
  getUsersList,
  toggleRestrictedValue,
  deleteUser,
  updateUserData,
} = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const {
  getAllTemplates,
  uploadTemplateByAdmin,
  deleteTemplateByAdmin,
  renameTemplateTitleByAdmin,
} = require("../controllers/templateController");
const uploadPdf = require("../middleware/multerPdf");

const adminRouter = express.Router();

adminRouter.post("/add-user", upload.single("image"), addNewUser);

adminRouter.post("/login", loginAdmin);

adminRouter.post("/users-list", adminAuth, getUsersList);

adminRouter.post("/toggle-restricted", adminAuth, toggleRestrictedValue);

adminRouter.post(
  "/update-user/:id",
  upload.single("image"),
  adminAuth,
  updateUserData
);

adminRouter.post("/delete-user/:id", adminAuth, deleteUser);

adminRouter.get("/templates", getAllTemplates);

adminRouter.post(
  "/upload-template",
  uploadPdf.single("pdf"),
  adminAuth,
  uploadTemplateByAdmin
);

adminRouter.post("/delete-template", adminAuth, deleteTemplateByAdmin);

adminRouter.post("/rename-template", adminAuth, renameTemplateTitleByAdmin);

module.exports = adminRouter;
