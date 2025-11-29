# Chat History Reference

## Chat 1: Database Architecture Overview

### Database Type: MongoDB with Mongoose

Your application uses **MongoDB** (cloud-based via MongoDB Atlas) with **Mongoose** as the ODM.

---

## Chat 2: Database Explanation (MongoDB, Models, Requests)

### Core Concept
MongoDB is a **document-based database** where data is organized in **collections** containing **documents** (similar to JSON objects).

### Three Main Collections:

#### **1. User Model** (`userModel.js`)
Stores user account information:
```javascript
User {
  - first_name, last_name (required)
  - email (unique, required)
  - password (encrypted)
  - resetOtp, resetOtpExpireAt (for password recovery)
  - isRestricted (account status - boolean)
  - image (profile picture URL)
  - date (account creation date)
  - recentTemplates[] (array of recently used templates with timestamps)
}
```

#### **2. Template Model** (`templateModel.js`)
Stores PDF document templates:
```javascript
Template {
  - uploaderId (user who uploaded it)
  - title (template name)
  - uploadedAt (creation date)
  - isPublic (visibility flag - boolean)
  - filePath (location in storage/Cloudinary)
  - frequency (how many times used - counter)
}
```

#### **3. Request Model** (`requestModel.js`) - **CORE MODEL**
Tracks all signature requests and their status:
```javascript
Request {
  - senderId → references User (who created the request)
  - title (request name)
  - status (pending/approved/rejected)
  
  - recipients[] (array of signers):
      ├─ userId → references User (who needs to sign)
      ├─ signed (boolean - has this person signed?)
      └─ signaturePositions[] (where to place signature on PDF)
          ├─ page (PDF page number)
          ├─ x, y (coordinates)
          ├─ width, height (dimensions)
  
  - emailSubject & emailMessage (notification content)
  - templateId → references Template (which PDF to sign)
  
  - pdfVersions[] (history of PDFs after each signature):
      ├─ version (version number)
      ├─ filePath (stored file location)
      └─ signedBy {
          ├─ userId (who signed)
          └─ signedAt (timestamp)
        }
  
  - timestamps (createdAt, updatedAt - automatic)
}
```

### Data Flow Example:

```
STEP 1: User uploads PDF template
        ↓
        Create Template document in DB

STEP 2: User creates signature request
        ↓
        Create Request document with:
        - senderId (current user)
        - recipients array (people to sign)
        - templateId (links to template)

STEP 3: Recipients receive email & sign
        ↓
        Update Request:
        - recipient.signed = true
        - Add new entry to pdfVersions

STEP 4: Track progress (your feature!)
        ↓
        Count: recipients.filter(r => r.signed === true).length
        Total: recipients.length
        Percent: (count / total) * 100
```

### Key Relationships (One-to-Many):
- 1 User → Many Requests (as sender)
- 1 User → Many Requests (as recipient)
- 1 Template → Many Requests (used in multiple requests)
- 1 Request → Many Recipients (multiple signers)

### Database Connection:
```javascript
// backend/config/database.js
const connect = await mongoose.connect(process.env.MONGODB_API);
```

---

## Chat 3: MongoDB Atlas & Local PDF Storage

### What is MongoDB Atlas?

**MongoDB Atlas** = Cloud-hosted, fully managed MongoDB database service

Instead of:
- ❌ Installing MongoDB on your computer
- ❌ Maintaining it 24/7
- ❌ Handling backups yourself

You get:
- ✅ Database hosted on MongoDB's secure servers
- ✅ Automatic backups & updates
- ✅ Available 24/7 globally
- ✅ Auto-scaling as your app grows

### Connection String Format:
```
mongodb+srv://username:password@cluster0.mongodb.net/doitung?retryWrites=true&w=majority
```
- `mongodb+srv://` — Atlas connection protocol
- `username:password` — Your credentials (from `.env`)
- `@cluster0.mongodb.net/` — Atlas cluster location
- `doitung` — Your database name
- Stored in: `process.env.MONGODB_API`

### Why MongoDB Atlas?

| Local MongoDB | MongoDB Atlas |
|---------------|---------------|
| ❌ Must keep computer on 24/7 | ✅ Always available |
| ❌ Manual backups | ✅ Automatic daily backups |
| ❌ Hard remote access | ✅ Access from anywhere |
| ❌ Limited scalability | ✅ Auto-scales on demand |
| ❌ Security is your responsibility | ✅ Enterprise-grade security |

---

### Local PDF Storage Issue

#### **Current Problem:**
Your backend has a `files/` folder where PDFs accumulate locally instead of going to cloud storage.

**File path:** `backend/files/[timestamp].pdf`

**Current storage:** ~130+ PDFs taking up 500MB+ disk space

#### **Why This Happens:**

In `templateController.js`, Cloudinary upload is **commented out**:
```javascript
// COMMENTED OUT - Files stay local!
// const fileUpload = await cloudinary.uploader.upload(pdfFile, {
//   resource_type: "raw",
//   folder: "pdfs",
// });
// fs.unlinkSync(req.file.path);  // Would delete local file

// CURRENT - Just saves locally
filePath: req.file.filename,  // Stores in backend/files/
```

#### **Upload Flow (Currently):**
```
1. User uploads PDF
   ↓
2. Multer saves to backend/files/[timestamp].pdf
   ↓
3. Filename stored in MongoDB
   ↓
4. File stays there permanently ❌
   ↓
5. Disk space accumulates
```

#### **Should Be (Cloud Storage):**
```
1. User uploads PDF
   ↓
2. Multer saves locally (temporary)
   ↓
3. Upload to Cloudinary → get URL
   ↓
4. Store Cloudinary URL in MongoDB
   ↓
5. Delete local file ✅
   ↓
6. Space saved, scalable
```

### Two Storage Strategies:

**Strategy 1: Local Storage (Current)**
- ✅ Easy for development
- ❌ Fills up disk space
- ❌ Lost if server crashes
- ❌ Not scalable

**Strategy 2: Cloud Storage (Best Practice)**
- ✅ Scalable & reliable
- ✅ Always accessible
- ✅ No disk space wasted
- ✅ Automatic backups
- ❌ Requires cloud service setup

### Multer Configuration:
```javascript
// backend/middleware/multerPdf.js
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./files");  // Local storage folder
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, uniqueSuffix + ".pdf");  // Generates filename with timestamp
  },
});
```

### Current Files Stored:
- Location: `backend/files/`
- Total: 130+ PDFs
- Size: ~500MB+
- Examples:
  - `1739813257472doitung-elearning.pdf`
  - `1763119750391-636204463.pdf`
  - Etc.

### Recommendations:

**Option 1: Quick Cleanup**
- Manually delete old PDFs from `backend/files/`
- Saves disk space immediately
- Not scalable long-term

**Option 2: Enable Cloudinary (Recommended)**
- Uncomment Cloudinary upload code
- Enable automatic file deletion
- Move to cloud storage
- Scalable & professional

**Option 3: Add Cleanup Script**
- Automatically delete files older than X days
- Keeps folder manageable
- Partial solution

---

## Summary

Your app architecture:
- **Database:** MongoDB Atlas (cloud)
- **Storage:** Currently local files in `backend/files/` (should be cloud)
- **Models:** Users, Templates, Requests (with nested recipients & signatures)
- **Progress Feature:** Calculate signed % from recipients array

Main issue: PDFs accumulating locally instead of being stored on Cloudinary cloud.

