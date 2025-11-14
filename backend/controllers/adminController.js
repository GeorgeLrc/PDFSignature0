const bcrypt = require("bcryptjs");
const { v2: cloudinary } = require("cloudinary");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

//create new user
const addNewUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const imageFile = req.file;

    if (!first_name || !last_name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    //validate strong passwor
    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    //error while hashing password
    // const hashedPassword = await bcrypt.hash(password, 10);

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const userData = {
      first_name,
      last_name,
      email,
      password: password,
      image: imageUrl || "",
      date: Date.now(),
    };

    console.log(userData);
    const newUser = new userModel(userData);
    await newUser.save();

    return res.json({ success: true, message: "New Doctor created", user: newUser });
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
    // Authenticate Admin
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Correct JWT Payload
      const tokenPayload = {
        email: email,
        role: "admin"
      };

      // Properly Sign the JWT with Expiry Time
      const token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });

      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
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
//update user
const updateUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, password } = req.body;
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

    // Create update object
    const updateData = {
      first_name,
      last_name,
      email,
      password,
    };

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, updateData, {
      new: true, // returns the updated document
    });

    return res.json({ success: true, message: "Updated successfully", user: updatedUser });
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

module.exports = {
  addNewUser,
  loginAdmin,
  getUsersList,
  toggleRestrictedValue,
  updateUserData,
  deleteUser,
};
