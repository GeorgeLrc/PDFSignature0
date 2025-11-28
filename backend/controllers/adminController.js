const bcrypt = require("bcryptjs");
const { v2: cloudinary } = require("cloudinary");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { validatePassword, getPasswordRequirements } = require("../utils/passwordValidator");

//create new user
const addNewUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const imageFile = req.file;

    if (!first_name || !last_name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        requirements: getPasswordRequirements(),
        errors: passwordValidation.errors,
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const userData = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      image: imageUrl || "",
      date: Date.now(),
    };

    console.log(userData);
    const newUser = new userModel(userData);
    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.json({ success: true, message: "New Doctor created", user: userResponse });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//admin login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Invalid Email" });
  }

  try {
    // Authenticate Admin using environment credentials
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      console.log("✅ Admin credentials verified from .env");
      
      // Find or create admin user in database
      let adminUser = await userModel.findOne({ email });
      
      if (!adminUser) {
        // Create admin user in database with hashed password
        console.log("📝 Creating admin user in database");
        const hashedPassword = await bcrypt.hash(password, 10);
        adminUser = new userModel({
          first_name: "Admin",
          last_name: "User",
          email: email,
          password: hashedPassword,
          image: "",
          isRestricted: false,
          date: Date.now(),
        });
        await adminUser.save();
        console.log("✅ Admin user created in database");
      } else {
        // Update admin password in case .env password changed
        console.log("🔄 Updating admin password in database");
        const hashedPassword = await bcrypt.hash(password, 10);
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log("✅ Admin password updated in database");
      }

      // Create JWT Payload with admin's user ID
      const tokenPayload = {
        id: adminUser._id, // Admin's user ID from database
        email: email,
        role: "admin"
      };

      console.log("🔐 JWT token created for admin:", adminUser._id);
      
      // Sign JWT with Expiry Time
      const token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });

      return res.json({ success: true, token });
    } else {
      console.error("❌ Invalid admin credentials");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("❌ Admin login error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUsersList = async (req, res) => {
  try {
    const users = await userModel.find();
    return res.json({ success: true, users });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const toggleRestrictedValue = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "User id is needed" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "No user with the provided id",
      });
    }

    await userModel.findByIdAndUpdate(userId, {
      isRestricted: !user.isRestricted,
    });

    return res.json({
      success: true,
      message: user.isRestricted ? "Unestricted" : "restricted",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//update user
const updateUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, password, adminPassword } = req.body;
    const imageFile = req.file;

    if (!id) {
      return res.json({ success: false, message: "User id is needed" });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.json({
        success: false,
        message: "No user with the provided id",
      });
    }

    // Verify admin password (security check for user updates)
    if (adminPassword) {
      console.log("🔐 Admin password verification started");
      console.log("Received adminPassword:", adminPassword ? "YES (length: " + adminPassword.length + ")" : "NO");
      console.log("req.user:", req.user);
      console.log("req.admin:", req.admin);
      
      // Get the admin's ID from the JWT token (userId in req.user from middleware)
      let adminId = req.user?.id;
      if (!adminId) {
        console.error("❌ Admin ID not found in req.user");
        return res.status(401).json({
          success: false,
          message: "Admin authentication failed - no admin ID",
        });
      }

      console.log("🔍 Looking up admin with ID:", adminId);

      // Try to find admin by ID, if not found try by email (fallback)
      let admin = await userModel.findById(adminId);
      if (!admin && typeof adminId === 'string' && adminId.includes('@')) {
        // adminId is actually an email, find by email
        console.log("📧 Admin not found by ID, trying by email:", adminId);
        admin = await userModel.findOne({ email: adminId });
      }

      if (!admin) {
        console.error("❌ Admin not found in database with ID/email:", adminId);
        return res.status(401).json({
          success: false,
          message: "Admin not found in database",
        });
      }

      console.log("✅ Admin found:", admin.email);
      console.log("Admin password exists:", !!admin.password);
      if (admin.password) {
        console.log("Admin password hash preview:", admin.password.substring(0, 10) + "...");
      }

      // Check if admin has a password
      if (!admin.password) {
        console.error("❌ Admin account has no password set");
        return res.status(401).json({
          success: false,
          message: "Admin account is not properly configured",
        });
      }

      // Verify admin password with bcrypt
      console.log("🔐 Comparing passwords with bcrypt...");
      console.log("Input password length:", adminPassword.length);
      console.log("Hash to compare against:", admin.password.substring(0, 20) + "...");
      
      try {
        const isAdminPasswordCorrect = await bcrypt.compare(adminPassword, admin.password);
        console.log("Bcrypt comparison result:", isAdminPasswordCorrect);
        
        if (!isAdminPasswordCorrect) {
          console.log("❌ Password comparison failed - incorrect password");
          return res.status(401).json({
            success: false,
            message: "Admin password is incorrect",
          });
        }

        console.log("✅ Password verified successfully");
      } catch (bcryptError) {
        console.error("❌ Bcrypt comparison error:", bcryptError.message);
        return res.status(401).json({
          success: false,
          message: "Error verifying admin password",
        });
      }
    } else {
      console.warn("⚠️ No admin password provided for verification");
    }

    // Create update object
    const updateData = {
      first_name,
      last_name,
      email,
    };

    // If password is provided, validate and hash it
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Password does not meet security requirements",
          requirements: getPasswordRequirements(),
          errors: passwordValidation.errors,
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, updateData, {
      new: true, // returns the updated document
    });

    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return res.json({ success: true, message: "Updated successfully", user: userResponse });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ success: false, message: "User id is needed" });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.json({
        success: false,
        message: "No user with the provided id",
      });
    }

    await userModel.findByIdAndDelete(id);

    return res.json({ success: true, message: "Deleted user successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Verify user password (Admin tool for testing/verification)
const verifyUserPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.json({
        success: false,
        message: "User ID and password are required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    return res.json({
      success: true,
      userId: user._id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      isPasswordCorrect: isPasswordCorrect,
      message: isPasswordCorrect
        ? "Password is correct ✅"
        : "Password is incorrect ❌",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Reset user password (Admin tool)
const resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.json({
        success: false,
        message: "User ID and new password are required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        requirements: getPasswordRequirements(),
        errors: passwordValidation.errors,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    return res.json({
      success: true,
      message: "User password reset successfully",
      userId: user._id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  addNewUser,
  loginAdmin,
  getUsersList,
  toggleRestrictedValue,
  updateUserData,
  deleteUser,
  verifyUserPassword,
  resetUserPassword,
};
