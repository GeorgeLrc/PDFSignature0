Doitung — Architecture Overview

## Purpose
This document explains the high-level architecture for Doitung, lists components, data flow, API endpoints, deployment recommendations, and security considerations. A PlantUML diagram is included in `docs/architecture.puml` (render it with PlantUML or an online renderer).

## Components
- Client
  - User App (React + Vite)
  - Admin App (React + Vite)
- API Server
  - Express.js application (Node.js)
  - Controllers: `userController`, `templateController`, `requestController`, `adminController`
  - Middleware: `userAuth`, `adminAuth`, `multer`/`multerPdf`, `nodemailer`
- Database
  - MongoDB (accessed via Mongoose)
- Storage & Services
  - Cloudinary for cloud storage of uploaded/generated PDFs
  - SMTP (nodemailer) for sending OTPs, notifications
  - Puppeteer for server-side PDF generation
- File System
  - Local `files/` folder for temporarily storing uploaded/created PDFs

## Data Models (summary)
- User
  - first_name, last_name, email, password, isRestricted, image, recentTemplates (refs to Template)
- Template
  - uploaderId, title, uploadedAt, isPublic, filePath
- Request
  - senderId, title, status (pending/approved/rejected), recipients [{ userId, signed, signaturePositions }], templateId, emailSubject, emailMessage, pdfVersions[{version, filePath, signedBy}] 

## Key APIs (overview)
Base paths: `/api/auth` (user routes) and `/api/admin` (admin routes)

User routes (selected):
- POST /api/auth/login — login, sets JWT cookie
- POST /api/auth/logout — clears cookie
- GET /api/auth/is-auth — auth check (protected)
- POST /api/auth/send-reset-otp — send OTP to email
- POST /api/auth/reset-password — set new password
- POST /api/auth/upload-template — upload PDF (multerPdf)
- GET /api/auth/templates — get user's templates
- GET /api/auth/templates/:id — get template by id
- POST /api/auth/create-request — create signing request
- POST /api/auth/signed-by-user — upload signed PDF for a request (multerPdf)
- POST /api/auth/generate-pdf — generate PDF from rich content (puppeteer)

Admin routes (selected):
- POST /api/admin/add-user — create a new user (multipart image)
- POST /api/admin/login — admin login
- POST /api/admin/users-list — (protected) get all users
- POST /api/admin/upload-template — upload template (multerPdf)
- GET /api/admin/templates — list all templates
- POST /api/admin/update-template-visibility — admin toggles public/private

## Core Flows
1. Authentication
   - User/admin POST /login -> server validates -> signs JWT (httpOnly cookie + returns token)
   - Protected endpoints require `userAuth` or `adminAuth` which verify JWT

2. Upload Template (User)
   - Client uploads PDF via `/upload-template` (multipart/form-data). `multerPdf` stores file locally (files/), controller saves record to MongoDB, optionally upload to Cloudinary.

3. Create Request
   - Sender creates a request referencing a `templateId`, lists recipients, subject, and message. Request stored in MongoDB, initial pdfVersions may contain the base template.

4. Sign Flow
   - Recipient opens signing URL -> signs in client -> client sends signed PDF to `/signed-by-user`. Server stores the signed PDF (local or Cloudinary), adds a new entry to `pdfVersions` in the Request, sets recipient.signed = true. If all recipients signed -> request.status = `approved`.

5. PDF Generation
   - Clients can send rich text content to `/generate-pdf` -> server uses Puppeteer to render HTML -> outputs PDF -> saved/uploaded similar to uploaded templates.

## Deployment & Infrastructure Recommendations
- Containerize each service (frontend apps + backend) with Docker. Example services:
  - frontend (port 5173), admin (5174), backend (5000)
- Use a managed MongoDB (Atlas) or a self-hosted replica set for production.
- Use Cloudinary for persistent PDF storage; keep local `files/` as temporary scratch.
- Use HTTPS (TLS) via reverse proxy (NGINX) or cloud load balancer.
- For email, use a reliable SMTP provider (SendGrid, Mailgun) configured in env vars.
- Scale backend horizontally behind a load balancer; ensure shared storage or Cloudinary for files.

## Security Hardening
- Use bcrypt for password hashing (note: login uses plain compare in current code — replace with bcrypt.compare).
- Use strong JWT secrets in env (`ACCESS_TOKEN_SECRET`). Store secrets in environment manager or vault.
- Set cookies with Secure, HttpOnly, SameSite attributes (already partly done). Consider storing tokens in Authorization header for SPA APIs.
- Validate and sanitize uploaded files: limit file types to application/pdf and limit sizes.
- Rate-limit endpoints that send OTPs and login attempts.
- Use CSRF protection if cookies for auth are used and web clients are on different origins.

## Observations & Improvements (short)
- Move password comparisons to bcrypt.compare in `userController.loginUser` (currently compares plaintext)
- Add input validation (zod is present on frontends; add server-side validation)
- Add tests: quick unit tests for controllers and integration tests for API routes
- Provide `.env.example` with required env vars: MONGODB_API, ACCESS_TOKEN_SECRET, CLOUDINARY_*, SENDER_EMAIL, etc.

## How to render the diagram
- If you have PlantUML locally: `plantuml docs/architecture.puml` will generate an SVG/PNG.
- Or use an online PlantUML renderer (e.g., https://plantuml.com/plantuml)

---

If you'd like, I can:
- Render and add an SVG (I can't run PlantUML here, but I can add an SVG stub or install a rendering pipeline if you want). 
- Add `.env.example` and a root README section for deploying the stack with Docker Compose.
- Create a diagram picking more details (sequence diagrams for sign flow or CI/CD pipeline).

Which next step do you want me to take?  (I can add a Docker Compose, `.env.example`, or sequence diagrams next.)