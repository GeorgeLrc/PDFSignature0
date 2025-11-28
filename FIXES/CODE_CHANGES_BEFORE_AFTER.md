# Code Changes - Before & After Comparison

## CRITICAL #4: Password Validation Rules - FIXED ✅

---

## File 1: `backend/utils/passwordValidator.js` (NEW FILE)

```javascript
/**
 * Password Validation Utility
 * Enforces strong password requirements
 */

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (@$!%*?&)
 * 
 * @param {string} password - The password to validate
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return {
      isValid: false,
      errors: ["Password is required"],
    };
  }

  // Check minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }

  // Check for digit
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one digit (0-9)");
  }

  // Check for special character
  if (!/[@$!%*?&]/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)");
  }

  // Check for common weak patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password cannot contain more than 2 consecutive identical characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const getPasswordRequirements = () => {
  return `Password must meet these requirements:
  • Minimum 8 characters
  • At least one uppercase letter (A-Z)
  • At least one lowercase letter (a-z)
  • At least one digit (0-9)
  • At least one special character (@$!%*?&)
  • No more than 2 consecutive identical characters`;
};

module.exports = {
  validatePassword,
  getPasswordRequirements,
};
```

---

## File 2: `backend/controllers/adminController.js`

### Change 1: Add Import

**BEFORE:**
```javascript
const bcrypt = require("bcryptjs");
const { v2: cloudinary } = require("cloudinary");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
```

**AFTER:**
```javascript
const bcrypt = require("bcryptjs");
const { v2: cloudinary } = require("cloudinary");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { validatePassword, getPasswordRequirements } = require("../utils/passwordValidator");
```

---

### Change 2: Update `addNewUser()` function

**BEFORE:**
```javascript
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
```

**AFTER:**
```javascript
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
```

**Key Changes:**
- ✅ Changed validation from `password.length < 6` to `validatePassword(password)`
- ✅ Returns detailed error messages with requirements
- ✅ Uncommented and enabled `bcrypt.hash()` for password hashing
- ✅ Changed `password: password` to `password: hashedPassword`
- ✅ Removed password from API response before sending

---

### Change 3: Update `updateUserData()` function

**BEFORE:**
```javascript
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
```

**AFTER:**
```javascript
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
```

**Key Changes:**
- ✅ Added conditional password validation (only if password is provided)
- ✅ Hash password before storing if provided
- ✅ Skip password update if not included in request
- ✅ Remove password from response
- ✅ Return detailed validation errors

---

## File 3: `backend/controllers/userController.js`

### Change 1: Add Import

**BEFORE:**
```javascript
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { transporter } = require("../middleware/nodemailer");
```

**AFTER:**
```javascript
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { transporter } = require("../middleware/nodemailer");
const { validatePassword, getPasswordRequirements } = require("../utils/passwordValidator");
```

---

### Change 2: Update `resetPassword()` function

**BEFORE:**
```javascript
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
```

**AFTER:**
```javascript
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
```

**Key Changes:**
- ✅ Added password validation before hashing
- ✅ Returns detailed validation errors
- ✅ Shows password requirements if validation fails

---

## Summary of Changes

| File | Type | Changes |
|------|------|---------|
| `backend/utils/passwordValidator.js` | NEW | Created password validation utility |
| `backend/controllers/adminController.js` | UPDATED | 3 changes: import, addNewUser(), updateUserData() |
| `backend/controllers/userController.js` | UPDATED | 2 changes: import, resetPassword() |

---

## Validation Rules Applied

```javascript
// All passwords must match ALL of these rules:
✓ Length >= 8 characters
✓ At least one uppercase letter (A-Z)
✓ At least one lowercase letter (a-z)
✓ At least one digit (0-9)
✓ At least one special character (@$!%*?&)
✓ No more than 2 consecutive identical characters
```

---

## Security Improvements Summary

| Aspect | Before | After |
|--------|--------|-------|
| Minimum Length | 6 | 8 |
| Uppercase Required | ❌ No | ✅ Yes |
| Lowercase Required | ❌ No | ✅ Yes |
| Digit Required | ❌ No | ✅ Yes |
| Special Char Required | ❌ No | ✅ Yes |
| Hashing | ❌ Disabled | ✅ Enabled |
| Password in Response | ⚠️ Exposed | ✅ Hidden |
| Error Messages | Generic | Detailed |

---

**Completed:** November 27, 2025 ✅
