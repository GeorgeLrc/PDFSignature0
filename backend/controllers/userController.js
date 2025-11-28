const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { transporter } = require("../middleware/nodemailer");
const { validatePassword, getPasswordRequirements } = require("../utils/passwordValidator");

// user login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    // Support both bcrypt-hashed and legacy plain-text stored passwords.
    // If stored password looks like a bcrypt hash, use bcrypt.compare.
    // If it's a legacy plain-text password, compare directly and upgrade to a hash on success.
    const storedPassword = user.password || "";
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

    let isCorrectPassword = false;
    if (isBcryptHash) {
      isCorrectPassword = await bcrypt.compare(password, storedPassword);
    } else {
      // Legacy account with plain-text password stored (pre-hash).
      isCorrectPassword = password === storedPassword;
      if (isCorrectPassword) {
        // Re-hash password and save upgraded record (non-blocking on errors).
        try {
          user.password = await bcrypt.hash(password, 10);
          await user.save();
        } catch (err) {
          // Log error but allow login to proceed; migration is best-effort.
          console.error("Failed to re-hash legacy password for user", user._id, err.message || err);
        }
      }
    }

    if (!isCorrectPassword) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    if (user.isRestricted) {
      return res.status(401).json({
        success: false,
        message: "Your account is blocked. Please contact the IT department.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Filtered safe user data
    const userData = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      image: user.image,
      isRestricted: user.isRestricted,
      recentTemplates: user.recentTemplates,
      date: user.date,
    };

    return res.status(200).json({
      success: true,
      accessToken: token,
      user: userData,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//user logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//check authenticated or not
const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//send reset otp to email
const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    //generate otp
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    //send otp email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Pasword Reset OTP",
      text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
    };
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Verification OTP sent to your Email",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//reset password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP and new password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//get current user
const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        image: user.image,
        isRestricted: user.isRestricted,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//get other users list (not include current user)
const getOtherUsersList = async (req, res) => {
  try {
    const { userId } = req.body;
    // Find all users except the current user
    const users = await userModel.find({ _id: { $ne: userId } });
    return res.json({ success: true, users });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  loginUser,
  logout,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  getCurrentUser,
  getOtherUsersList,
};
