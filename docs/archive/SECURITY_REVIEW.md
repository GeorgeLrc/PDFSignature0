# Security Review Report - Doitung Application

**Date:** November 27, 2025  
**Application:** Doitung (Digital Document Signing System)  
**Scope:** Backend Security Analysis

---

## 🔴 CRITICAL SECURITY ISSUES

### 1. **CRITICAL: Plain Text Password Comparison (userController.js)**
**Severity:** 🔴 CRITICAL  
**Location:** `backend/controllers/userController.js` - Line 17

```javascript
const isCorrectPassword = user.password === password; // Use bcrypt in production
```

**Issue:** Passwords are compared in plain text instead of using bcrypt. This is explicitly flagged in the code comment but not fixed.

**Risk:**
- If database is compromised, all passwords are exposed
- Passwords can be read by anyone with database access
- Violates security best practices

**Fix:**
```javascript
const isCorrectPassword = await bcrypt.compare(password, user.password);
```

---

### 2. **CRITICAL: Passwords Stored in Plain Text (adminController.js)**
**Severity:** 🔴 CRITICAL  
**Location:** `backend/controllers/adminController.js` - Lines 35-40 & 160-162

```javascript
// addNewUser function - password NOT hashed
const userData = {
  first_name,
  last_name,
  email,
  password: password, // PLAIN TEXT!
  image: imageUrl || "",
  date: Date.now(),
};

// updateUserData function - password NOT hashed
const updateData = {
  first_name,
  last_name,
  email,
  password, // PLAIN TEXT!
};
```

**Issue:** Passwords are stored as plain text in the database. The bcrypt hashing is commented out (line 31).

**Risk:**
- Complete compromise of user credentials
- Database breach exposes all passwords
- Violates GDPR, CCPA, and security standards
- Attackers can access user accounts directly

**Fix:**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
const userData = {
  first_name,
  last_name,
  email,
  password: hashedPassword,
  image: imageUrl || "",
  date: Date.now(),
};
```

---

### 3. **CRITICAL: Admin Credentials Hardcoded in Environment Variables (Exposed)**
**Severity:** 🔴 CRITICAL  
**Location:** `backend/controllers/adminController.js` - Line 52

```javascript
if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)
```

**Issue:** Admin password stored in plain text in `.env` file. While `.env` should be gitignored, this is a security anti-pattern.

**Risk:**
- Admin credentials in version control history (if accidentally committed)
- Environment variables can be exposed through logs, dumps, or container introspection
- Single admin account with no rotation policy

**Fix:**
- Store only admin email in `.env`
- Use bcrypt to hash the admin password
- Implement admin registration/setup endpoint with proper validation

---

### 4. **CRITICAL: No Password Validation Rules**
**Severity:** 🔴 CRITICAL  
**Location:** `backend/controllers/adminController.js` - Lines 25-29

```javascript
if (password.length < 6) {
  return res.json({
    success: false,
    message: "Please enter a strong password",
  });
}
```

**Issue:** Only checks password length >= 6. No complexity requirements (uppercase, lowercase, numbers, special characters).

**Risk:**
- Users can set weak passwords like "123456" or "password"
- Dictionary attacks are effective
- Weak passwords are easily guessed or brute-forced

**Fix:**
```javascript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(password)) {
  return res.json({
    success: false,
    message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
  });
}
```

---

### 5. **CRITICAL: Unrestricted File Upload (multer.js)**
**Severity:** 🔴 CRITICAL  
**Location:** `backend/middleware/multer.js`

```javascript
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname); // NO VALIDATION!
  },
});

const upload = multer({ storage }); // NO FILE SIZE, TYPE, OR NAME LIMITS!
```

**Issue:** 
- No file type validation
- No file size limit
- Uses original filename (security risk)
- Files stored on disk without validation

**Risk:**
- Malicious file upload (executables, scripts)
- Disk space exhaustion attacks
- Path traversal attacks via filename
- Virus/malware uploads

**Fix:**
```javascript
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, '../files'));
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: function (req, file, callback) {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type'));
    }
  },
});
```

---

### 6. **CRITICAL: No SQL Injection / NoSQL Injection Protection**
**Severity:** 🔴 CRITICAL  
**Location:** Multiple files using `userModel.find()`, `findById()`, `findOne()`

**Issue:** While Mongoose provides some protection, direct use of user input in queries without validation or sanitization is risky.

**Risk:**
- NoSQL injection through email or ID parameters
- Unauthorized data access or modification

**Fix:**
```javascript
// Use middleware to validate input format
const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  next();
};

// Use it on routes with :id parameter
```

---

## 🟠 HIGH SECURITY ISSUES

### 7. **HIGH: Session Fixation - Predictable Token**
**Severity:** 🟠 HIGH  
**Location:** `backend/middleware/userAuth.js`, `controllers/userController.js`

**Issue:** JWT tokens use only user ID as payload. No additional security context.

**Risk:**
- If token is stolen, attacker has full access
- No mechanism to revoke tokens
- Token doesn't include user role/permissions verification

**Fix:**
```javascript
const token = jwt.sign(
  { 
    id: user._id, 
    email: user.email,
    role: user.role || 'user',
    iat: Math.floor(Date.now() / 1000)
  }, 
  process.env.ACCESS_TOKEN_SECRET, 
  { expiresIn: "7d" }
);
```

---

### 8. **HIGH: No Rate Limiting on Authentication Endpoints**
**Severity:** 🟠 HIGH  
**Location:** `routes/userRoute.js` - `/login`, `/send-reset-otp`, `/reset-password`

**Issue:** Brute force attacks are possible without rate limiting.

**Risk:**
- Password brute forcing
- OTP brute forcing
- Denial of service on authentication

**Fix:**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

userRouter.post("/login", loginLimiter, loginUser);
userRouter.post("/send-reset-otp", loginLimiter, sendResetOtp);
```

---

### 9. **HIGH: OTP Generation Using Math.random() (Insecure)**
**Severity:** 🟠 HIGH  
**Location:** `backend/controllers/userController.js` - Line 91

```javascript
const otp = String(Math.floor(100000 + Math.random() * 900000));
```

**Issue:** `Math.random()` is not cryptographically secure. OTPs can be predicted.

**Risk:**
- OTPs can be guessed or predicted
- Password reset bypass
- Account takeover

**Fix:**
```javascript
const crypto = require('crypto');
const otp = crypto.randomInt(100000, 999999).toString();
```

---

### 10. **HIGH: No CSRF Protection**
**Severity:** 🟠 HIGH  
**Location:** All routes

**Issue:** No CSRF tokens implemented. Application is vulnerable to cross-site request forgery attacks.

**Risk:**
- Attackers can perform unauthorized actions on behalf of users
- State-changing operations (delete, update) can be hijacked

**Fix:**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);
```

---

### 11. **HIGH: Hardcoded Cloudinary Credentials (Potentially)**
**Severity:** 🟠 HIGH  
**Location:** `backend/config/cloudinary.js`

**Issue:** Cloudinary credentials stored in environment variables but configuration file not reviewed.

**Risk:**
- If `.env` is exposed, cloud storage is compromised
- Unauthorized file uploads to Cloudinary

---

### 12. **HIGH: No Input Validation on Email Parameter**
**Severity:** 🟠 HIGH  
**Location:** Multiple locations in `userController.js`

**Issue:** Email validation is minimal. No regex or proper email validation.

**Risk:**
- Malformed emails in database
- Email enumeration attacks

**Fix:**
```javascript
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

if (!isValidEmail(email)) {
  return res.status(400).json({ success: false, message: "Invalid email format" });
}
```

---

## 🟡 MEDIUM SECURITY ISSUES

### 13. **MEDIUM: Insecure Cookie SameSite Policy**
**Severity:** 🟡 MEDIUM  
**Location:** `backend/controllers/userController.js` - Lines 35-41

```javascript
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**Issue:** `sameSite: "none"` in production allows cross-site requests.

**Risk:**
- CSRF vulnerabilities with `sameSite: "none"`
- Cross-site cookie leakage

**Fix:**
```javascript
sameSite: "strict" // Always use strict, or "lax" for legitimate cross-site requests
```

---

### 14. **MEDIUM: Detailed Error Messages Expose Information**
**Severity:** 🟡 MEDIUM  
**Location:** Throughout controllers

**Issue:** Error messages reveal internal information (e.g., "Invalid email" vs generic error).

**Risk:**
- User enumeration attacks
- Information disclosure
- Helps attackers understand system structure

**Fix:**
```javascript
return res.status(401).json({ 
  success: false, 
  message: "Invalid credentials" // Generic message
});
```

---

### 15. **MEDIUM: No Access Control on User List Endpoint**
**Severity:** 🟡 MEDIUM  
**Location:** `backend/controllers/userController.js` - `getOtherUsersList`

**Issue:** Any authenticated user can retrieve all other users' information.

**Risk:**
- Privacy violation
- User enumeration
- Harvesting user data

**Fix:**
```javascript
// Add role-based access control
const getOtherUsersList = async (req, res) => {
  try {
    const { userId } = req.body;
    // Verify user has permission to see user list
    const currentUser = await userModel.findById(userId);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const users = await userModel.find({ _id: { $ne: userId } }).select('-password');
    return res.json({ success: true, users });
  } catch (error) {
    return res.json({ success: false, message: "An error occurred" });
  }
};
```

---

### 16. **MEDIUM: Passwords Returned in Responses**
**Severity:** 🟡 MEDIUM  
**Location:** `adminController.js` - Lines 45 & 167

```javascript
return res.json({ success: true, message: "New Doctor created", user: newUser });
// newUser includes password in response!
```

**Issue:** User objects with passwords are sent in API responses.

**Risk:**
- Password exposure in API responses
- Passwords visible in browser history, logs, monitoring tools

**Fix:**
```javascript
const userResponse = newUser.toObject();
delete userResponse.password;
return res.json({ success: true, message: "New Doctor created", user: userResponse });
```

---

### 17. **MEDIUM: No Logging or Audit Trail**
**Severity:** 🟡 MEDIUM  
**Location:** All controllers

**Issue:** No logging of important security events (login, failed attempts, admin actions).

**Risk:**
- Cannot detect suspicious activity
- No forensic trail for incidents
- Compliance violations (GDPR, HIPAA)

**Fix:**
```javascript
const logger = require('./utils/logger');

const loginUser = async (req, res) => {
  logger.info(`Login attempt for email: ${email}`);
  // ... rest of logic
};
```

---

### 18. **MEDIUM: No API Rate Limiting (General)**
**Severity:** 🟡 MEDIUM  
**Location:** All routes

**Issue:** No general rate limiting on API endpoints.

**Risk:**
- DoS attacks
- Resource exhaustion
- API abuse

**Fix:**
```javascript
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
});

app.use(generalLimiter);
```

---

### 19. **MEDIUM: No API Documentation Security Headers**
**Severity:** 🟡 MEDIUM  
**Location:** `server.js`

**Issue:** Missing security headers (X-Frame-Options, X-Content-Type-Options, etc).

**Risk:**
- Clickjacking attacks
- MIME type sniffing
- XSS attacks

**Fix:**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

### 20. **MEDIUM: Incomplete Input Validation**
**Severity:** 🟡 MEDIUM  
**Location:** Multiple controllers

**Issue:** Only checks if fields exist, not their format, length, or content.

**Risk:**
- Invalid data in database
- Potential for injection attacks
- Data integrity issues

---

## 🔵 LOW SECURITY ISSUES

### 21. **LOW: Hardcoded Port and Configuration**
**Location:** `server.js` - Line 37

```javascript
const PORT = process.env.PORT || 5000;
```

### 22. **LOW: Missing HTTPS Enforcement**
**Location:** `server.js`

**Issue:** No automatic HTTPS redirect in production.

---

## ✅ POSITIVE SECURITY FINDINGS

1. ✓ Uses bcryptjs for password hashing (when implemented)
2. ✓ JWT token expiration set (7 days)
3. ✓ CORS configured with whitelist (though localhost-only)
4. ✓ Cookie httpOnly flag enabled
5. ✓ Environment variables for sensitive data
6. ✓ Mongoose provides some injection protection
7. ✓ Admin authentication middleware implemented

---

## 🚨 RECOMMENDED IMMEDIATE ACTIONS (Priority Order)

### Phase 1: CRITICAL (Do First - Within 24 hours)
1. **Fix password hashing in `userController.js`** - Use bcrypt.compare()
2. **Fix password hashing in `adminController.js`** - Hash passwords before storage
3. **Remove plain text admin password from `.env`** - Implement proper admin setup
4. **Add file upload validation** - Restrict file types and size
5. **Add input validation** - Email format, password requirements

### Phase 2: HIGH (Within 1 week)
6. Add rate limiting to auth endpoints
7. Replace Math.random() with crypto for OTP
8. Add CSRF protection
9. Implement access control checks
10. Remove passwords from API responses

### Phase 3: MEDIUM (Within 2 weeks)
11. Add logging and audit trail
12. Implement general rate limiting
13. Add security headers (helmet.js)
14. Fix cookie sameSite policy
15. Use generic error messages

### Phase 4: LOW (Ongoing)
16. Add comprehensive input validation
17. Implement monitoring and alerting
18. Regular security audits
19. Dependency updates and CVE scanning
20. Security testing and pen testing

---

## 📋 SECURITY CHECKLIST

- [ ] Password hashing implemented correctly
- [ ] File upload validation added
- [ ] Rate limiting implemented
- [ ] Input validation comprehensive
- [ ] CSRF protection added
- [ ] Security headers added
- [ ] Logging implemented
- [ ] Access control enforced
- [ ] Passwords not returned in responses
- [ ] Error messages are generic
- [ ] Admin setup properly secured
- [ ] Dependencies updated
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Security testing completed

---

## 🔗 Resources & References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

**Report Generated:** November 27, 2025  
**Status:** ⚠️ SECURITY REVIEW COMPLETE - CRITICAL ISSUES FOUND
