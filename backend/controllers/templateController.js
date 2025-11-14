const { v2: cloudinary } = require("cloudinary");
const templateModel = require("../models/templateModel");
const fs = require("fs");
const path = require("path");
const userModel = require("../models/userModel");
const puppeteer = require("puppeteer");

//create template including
const uploadTemplate = async (req, res) => {
  try {
    const { userId, isPublic, title } = req.body;
    console.log(req.file);

    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const pdfFile = req.file.path;

    // const fileUpload = await cloudinary.uploader.upload(pdfFile, {
    //   resource_type: "raw",
    //   folder: "pdfs",
    //   type: "upload",
    // });
    // const fileUrl = fileUpload.url;

    const newTemplate = new templateModel({
      uploaderId: userId,
      title,
      isPublic,
      filePath: req.file.filename,
      uploadedAt: Date.now(),
    });
    await newTemplate.save();

    // Delete the locally uploaded file (since it's already uploaded to Cloudinary)
    // fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      message: "Uploaded template successfully.",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//get all templates
const getAllTemplatesByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const templates = await templateModel.find({ uploaderId: userId });
    return res.json({ success: true, templates });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Rename template title(user can rename the template uploaded by himself)
const renameTemplateTitle = async (req, res) => {
  try {
    const { userId, templateId, newTitle } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const template = await templateModel.findById(templateId);
    if (!template) {
      return res.json({
        success: false,
        message: "No template with provided template id",
      });
    }

    if (template.uploaderId !== userId) {
      return res.json({
        success: false,
        message: "You can't rename others' template",
      });
    }

    await templateModel.findByIdAndUpdate(templateId, { title: newTitle });

    return res.json({
      success: true,
      message: "Updated new title successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//delete template(user can delete the template uploaded by himself)
const deleteTemplate = async (req, res) => {
  try {
    const { userId, templateId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const template = await templateModel.findById(templateId);
    if (!template) {
      return res.json({
        success: false,
        message: "No template with provided template id",
      });
    }

    if (template.uploaderId !== userId) {
      return res.json({
        success: false,
        message: "You can't delete others' template",
      });
    }

    await templateModel.findByIdAndDelete(templateId);

    // Remove templateId from recentTemplates of the user
    await userModel.findByIdAndUpdate(
      userId,
      { $pull: { recentTemplates: { templateId: templateId } } },
      { new: true }
    );

    // Remove templateId from all other users' recentTemplates
    await userModel.updateMany(
      { "recentTemplates.templateId": templateId },
      { $pull: { recentTemplates: { templateId: templateId } } }
    );

    return res.json({
      success: true,
      message: "Deleted template successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//get template by template id
const getTemplateByTemplateId = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const template = await templateModel.findById(id);
    if (!template) {
      return res.json({
        success: false,
        message: "Template not found",
      });
    }

    // Update User's Recent Templates List
    // Remove if already exists
    await userModel.findByIdAndUpdate(userId, {
      $pull: { recentTemplates: { templateId: id } },
    });

    await userModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          recentTemplates: {
            templateId: id,
            lastOpened: Date.now(),
          },
        },
      },
      { new: true }
    );

    return res.json({ success: true, template });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//get all the public templates for the other users(but no include the public templates from thes current user)
const getAllPublicTemplates = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    //public templates but exclude the ones created by the current user
    const templates = await templateModel.find({
      isPublic: true,
      uploaderId: { $ne: userId },
    });

    return res.json({ success: true, templates });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//get recent templates by the current user
const getRecentTemplates = async (req, res) => {
  try {
    const { userId } = req.body;

    // Get User's Recent Templates with full template details
    const user = await userModel
      .findById(userId)
      .populate("recentTemplates.templateId");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, recentTemplates: user.recentTemplates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//get all templates
const getAllTemplates = async (req, res) => {
  try {
    const templates = await templateModel.find();

    return res.json({ success: true, templates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//upload template by admin
//upload template by admin
const uploadTemplateByAdmin = async (req, res) => {
  try {
    const { isPublic, title } = req.body;

    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const newTemplate = new templateModel({
      title,
      isPublic,
      filePath: req.file.filename,
      uploadedAt: Date.now(),
    });

    await newTemplate.save();

    return res.json({
      success: true,
      message: "Uploaded template successfully.",
      template: newTemplate,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//delete template by admin
const deleteTemplateByAdmin = async (req, res) => {
  try {
    const { templateId } = req.body;

    const template = await templateModel.findById(templateId);
    if (!template) {
      return res.json({
        success: false,
        message: "No template with provided template id",
      });
    }

    await templateModel.findByIdAndDelete(templateId);

    // Remove templateId from all other users' recentTemplates
    await userModel.updateMany(
      { "recentTemplates.templateId": templateId },
      { $pull: { recentTemplates: { templateId: templateId } } }
    );

    return res.json({
      success: true,
      message: "Deleted template successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Rename template title by admin
const renameTemplateTitleByAdmin = async (req, res) => {
  try {
    const { templateId, newTitle } = req.body;

    const template = await templateModel.findById(templateId);
    if (!template) {
      return res.json({
        success: false,
        message: "No template with provided template id",
      });
    }

    await templateModel.findByIdAndUpdate(templateId, { title: newTitle });

    return res.json({
      success: true,
      message: "Updated new title successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const generateAndUploadPDF = async (req, res) => {
  try {
    const { userId, isPublic, title, content } = req.body;

    if (!content) {
      return res.json({ success: false, message: "Content is required" });
    }

    // Start Puppeteer browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Define proper CSS styling
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              line-height: 1.6;
            }
            h1 {
              text-align: center;
              color: #333;
            }
            p {
              font-size: 14px;
              color: #444;
            }
            img {
              max-width: 100%;
              display: block;
              margin: 10px auto;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          ${content}  <!-- ReactQuill HTML content -->
          <div class="footer">Generated by InnoSpace</div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);

    // Define the PDF file path
    const pdfFilePath = path.join(
      __dirname,
      "../files",
      `${Date.now()}_document.pdf`
    );

    // Generate the PDF
    await page.pdf({
      path: pdfFilePath,
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    // Attach the generated PDF to the request object (same structure as multer)
    req.file = { path: pdfFilePath, filename: path.basename(pdfFilePath) };

    // Call the existing uploadTemplate function to upload the file
    await uploadTemplate(req, res); // This will handle the upload logic
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadTemplate,
  getAllTemplatesByUser,
  renameTemplateTitle,
  deleteTemplate,
  getTemplateByTemplateId,
  getAllPublicTemplates,
  getRecentTemplates,
  getAllTemplates,
  uploadTemplateByAdmin,
  deleteTemplateByAdmin,
  renameTemplateTitleByAdmin,
  generateAndUploadPDF,
};
