# 🚀 Quick Setup Guide - Admin Password Tools

**Created:** November 27, 2025

---

## ✅ What's New

Two new admin endpoints added to manage user passwords:

1. **Verify User Password** - Check if password is correct
2. **Reset User Password** - Set a new password for a user

---

## 📍 File Changes

| File | Changes |
|------|---------|
| `backend/controllers/adminController.js` | ✅ Added 2 functions |
| `backend/routes/adminRoute.js` | ✅ Added 2 routes + imports |

---

## 🔌 API Endpoints

### ✅ Verify Password
```
POST /api/admin/verify-password
Authorization: Bearer <admin_token>

Body:
{
  "userId": "user_mongo_id",
  "password": "password_to_check"
}

Response:
{
  "success": true,
  "userId": "...",
  "email": "user@example.com",
  "name": "John Doe",
  "isPasswordCorrect": true,
  "message": "Password is correct ✅"
}
```

### 🔑 Reset Password
```
POST /api/admin/reset-password
Authorization: Bearer <admin_token>

Body:
{
  "userId": "user_mongo_id",
  "newPassword": "NewSecurePass@123"
}

Response:
{
  "success": true,
  "message": "User password reset successfully",
  "userId": "...",
  "email": "user@example.com",
  "name": "John Doe"
}
```

---

## 🧪 Test Commands

### Test 1: Verify Password (Correct)
```bash
curl -X POST http://localhost:5000/api/admin/verify-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "USER_ID_HERE",
    "password": "ActualPassword123!"
  }'
```

Expected: `"isPasswordCorrect": true`

### Test 2: Verify Password (Incorrect)
```bash
curl -X POST http://localhost:5000/api/admin/verify-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "USER_ID_HERE",
    "password": "WrongPassword"
  }'
```

Expected: `"isPasswordCorrect": false`

### Test 3: Reset Password
```bash
curl -X POST http://localhost:5000/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "USER_ID_HERE",
    "newPassword": "NewSecurePass@2025"
  }'
```

Expected: `"success": true`

---

## 📋 Use Case: Check if User Password is Working

**Scenario:** Admin created a user and wants to verify password works

**Steps:**

1. **Admin creates user:**
   ```bash
   POST /api/admin/add-user
   {
     "first_name": "John",
     "last_name": "Doe",
     "email": "john@example.com",
     "password": "SecurePass123!",
     "image": [image file]
   }
   ```

2. **Admin verifies the password works:**
   ```bash
   POST /api/admin/verify-password
   {
     "userId": "65d2f1a1b2c3d4e5f6g7h8i9",
     "password": "SecurePass123!"
   }
   ```
   
   Response: `✅ Password is correct`

3. **User tries to login:**
   - Email: john@example.com
   - Password: SecurePass123!
   - ✅ Login successful!

---

## 🛡️ Security Points

✅ Both endpoints require admin authentication  
✅ Password strength validated on reset  
✅ Uses bcrypt for secure comparison  
✅ Passwords never exposed in response  
✅ User info returned for verification  

---

## 📚 Full Documentation

See: `backend/ADMIN_PASSWORD_TOOLS.md`

Contains:
- Complete API reference
- Use cases
- JavaScript examples
- Testing checklist
- Security notes
- Future enhancements

---

## ❓ FAQ

**Q: Why would admin need to verify a password?**
A: Troubleshooting - if user claims password is wrong, admin can test it

**Q: Is it secure to have admin reset passwords?**
A: Yes - admin auth required, password validated, bcrypt hashing used

**Q: Can this be used to bypass security?**
A: No - admin must be authenticated, and password strength is enforced

**Q: What if admin token is compromised?**
A: These endpoints would be vulnerable. Use strong admin credentials and JWT expiry

---

**Status:** ✅ Ready to Use  
**Documentation:** `backend/ADMIN_PASSWORD_TOOLS.md`
