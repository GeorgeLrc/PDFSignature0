Doitung — Final System Report

Date: 2025-11-24
Author: (Your Name)

---

## Executive Summary
Doitung is a document-template and e-signature workflow system comprised of two React single-page applications (User and Admin) and a Node.js/Express backend with MongoDB for persistence. Users can upload and share PDF templates, create signing requests with multiple recipients, and capture signed PDF versions with an auditable history. The Admin app provides user and template management.

This report summarizes architecture, components, data models, main API surface, core flows (login, upload, request creation, signing), security measures, deployment recommendations, test strategy, limitations, and suggested next steps.

## 1. System Overview
- Frontend
  - User App: `frontend/` — React (v19), Vite, Tailwind CSS. Handles user interactions: login, viewing templates, creating requests, signing PDFs.
  - Admin App: `admin/` — React, Vite; admin-specific management pages.
- Backend
  - Express.js app in `backend/` exposing REST APIs under `/api/auth/*` and `/api/admin/*`.
  - Business logic split into controllers: `userController`, `templateController`, `requestController`, `adminController`.
- Data Store
  - MongoDB (Mongoose models in `backend/models`) for users, templates, requests and PDF version history.
- Services
  - File upload middleware (`multer` / `multerPdf`) storing temporary files under `backend/files/`.
  - Cloudinary integration for long-term file storage (configured in `backend/config/cloudinary.js`).
  - Nodemailer for email (OTP) notifications.
  - Puppeteer for server-side generation of PDFs from rich content.

## 2. Architecture (High Level)
- Component responsibilities
  - Frontend: UI, client-side validation, calling backend APIs, presenting PDF viewers, upload & signing UI.
  - Backend: authentication (JWT), file handling, business logic, DB read/write, integrations with Cloudinary/SMTP, PDF generation.
  - Database: persistent store for users, templates metadata, requests, and PDF signing history.

- Diagram
  - PlantUML source: `docs/architecture.puml` (render with PlantUML to produce a diagram). The diagram shows User/Admin -> Express API -> MongoDB, Cloudinary, SMTP, Puppeteer.

## 3. Data Models (summary)
- User (collection `users`)
  - first_name, last_name, email, password (hashed), resetOtp, resetOtpExpireAt, isRestricted, image, date, recentTemplates [{ templateId, lastOpened }]
- Template (collection `templates`)
  - uploaderId, title, uploadedAt, isPublic, filePath (local filename), frequency
- Request (collection `requests`)
  - senderId, title, status (pending/approved/rejected), recipients [{ userId, signed, signaturePositions }], templateId, emailSubject, emailMessage, pdfVersions [{ version, filePath, signedBy: { userId, signedAt } }]

## 4. Main API Surface (selected endpoints)
- User (base `/api/auth`)
  - POST /login — user login; returns JWT (and sets httpOnly cookie)
  - POST /logout — clear auth cookie
  - GET /is-auth — protected auth-check
  - POST /send-reset-otp — send password-reset OTP via email
  - POST /reset-password — reset user password (uses bcrypt on backend)
  - POST /upload-template — upload PDF template (multipart)
  - GET /templates — list templates for current user
  - GET /templates/:id — fetch a template by id
  - POST /create-request — create signing request
  - POST /signed-by-user — upload signed PDF and store version
  - POST /generate-pdf — server-side generate PDF via Puppeteer
- Admin (base `/api/admin`)
  - POST /login — admin authentication
  - POST /add-user — add a user (accepts image upload)
  - POST /users-list — get list of users (protected)
  - POST /upload-template — admin upload template
  - GET /templates — list all templates

(Full endpoint listing can be extracted from `backend/routes/*.js`.)

## 5. Core User Flows
1. Authentication
   - User submits credentials to `/api/auth/login`. Server validates, signs a JWT, sends it back and sets `token` cookie (httpOnly). Frontend uses returned user data for session.
2. Upload Template
   - Client uploads a PDF (multipart/form-data) to `/upload-template`. Backend saves the file (temporary) and creates a Template record. Optionally uploaded to Cloudinary for persistent storage.
3. Create Signing Request
   - Sender creates a Request that references a Template and a recipients list. Backend creates a Request document and may send notification emails to recipients.
4. Sign and Save Version
   - Each recipient signs in UI and posts the signed PDF to `/signed-by-user`. The backend stores the new PDF version, marks the recipient as signed, and updates request.status to `approved` once all recipients sign. Past versions are retained in `pdfVersions` for audit.
5. Generate PDF
   - Client submits HTML content to `/generate-pdf`. Backend launches Puppeteer, renders content to PDF, and stores it as a Template.

## 6. Security & Hardening Recommendations
- Passwords: use `bcrypt.hash` for storage and `bcrypt.compare` for login checks (note: current code has a plain-text password equality in one place — fix immediately).
- JWT: use a strong `ACCESS_TOKEN_SECRET`. Rotate secrets and store them in a secrets manager or environment variables.
- Cookies: `HttpOnly`, `Secure`, and proper `SameSite` attributes are set conditionally for production; ensure HTTPS in production.
- Input validation: implement server-side validation (Zod or Joi) for all controller inputs; front-end zod usage is good but server validation is required.
- File uploads: restrict accepted mime-types (application/pdf), limit file size, and scan files if possible.
- Rate limiting: apply rate limiting for login and OTP endpoints (express-rate-limit).
- CSRF: if cookies are used for auth across origins, implement CSRF protections or prefer Authorization headers.
- Logging & monitoring: use structured logs, and an error tracking solution like Sentry.

## 7. Deployment & Operations
- Recommended production deployment
  - Containerize apps (Backend, Frontend, Admin) with Docker.
  - Use a managed MongoDB (Atlas) or production-grade replica set.
  - Use Cloudinary for file storage to enable stateless backend scaling.
  - Run app instances behind a load balancer; enforce TLS termination at the edge.
  - Use a CI/CD pipeline to lint, test, build, and deploy artifacts.

- Minimal local setup for development
  - Backend: run from `backend/`
    - npm install
    - create `.env` based on `.env.example` (see Appendix)
    - npm run dev (nodemon server.js)
  - Frontend and Admin: run from `frontend/` and `admin/`
    - npm install
    - npm run dev (Vite)

## 8. Testing Strategy
- Unit tests: add tests for controllers and utility functions (Jest or Vitest).
- Integration tests: test API endpoints with an in-memory MongoDB (mongodb-memory-server) or a test container.
- End-to-end: use Playwright or Cypress for key flows: login, upload template, create request, signing flow.
- CI: run lint, unit/integration tests, and build checks in pull requests.

## 9. Limitations & Known Issues
- Password checking bug: currently, the `loginUser` controller contains a direct string compare; must switch to `bcrypt.compare`.
- No server-side input validation; relies on frontend validation only (risk).
- Local file storage (`backend/files/`) may cause issues if backend scales horizontally unless files are immediately pushed to Cloudinary or a shared storage.
- Lack of automated tests and CI pipeline.

## 10. Future Work & Enhancements
- Implement background job processing (BullMQ + Redis) for emails and large PDF generation.
- Add audit logging for access and changes to requests/templates.
- Support templating versions and template diffs.
- Add role-based access controls and admin audit trails.
- Add multi-tenant support if needed.

## 11. Appendix
### Files of interest
- `backend/server.js` — main API server
- `backend/routes/*.js` — routes for users and admin
- `backend/controllers/*.js` — application logic
- `backend/models/*.js` — Mongoose models
- `backend/middleware/*` — authentication and file upload middleware
- `frontend/` — user-facing SPA (Vite + React)
- `admin/` — admin SPA
- `docs/architecture.puml` — PlantUML component diagram
- `docs/architecture.md` — previously generated architecture notes

### Environment variables (create `.env` in `backend/`)
- MONGODB_API — MongoDB connection string
- ACCESS_TOKEN_SECRET — JWT secret
- CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET — Cloudinary credentials
- SENDER_EMAIL — email from which OTPs are sent
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS — SMTP server details (if required)

### How to render the architecture diagram
- With PlantUML locally: `plantuml docs/architecture.puml` to produce SVG/PNG
- Online: paste `docs/architecture.puml` into an online PlantUML renderer (e.g. https://www.plantuml.com/plantuml)

---

If you want, I can:
- Tailor any section into LaTeX/Word-ready formatting for your final report.
- Create a short one-page summary slide (PowerPoint/Markdown) for presentations.
- Implement the `.env.example` and a Docker Compose file to make reproducing the environment trivial.

Which one should I do next?