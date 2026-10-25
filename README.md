# Securedocs: Secure Document Sharing Platform

SecureDocs is a security-first document management platform designed to eliminate accidental over-sharing and provide an incontrovertible audit trail. It enforces precise, user-specific file access controls and logs every system action to a permanent ledger.

## Live Deployment
- **Frontend URL:** https://securedocs-mocha.vercel.app/
- **Backend API URL:** https://securedocs-api-ux8z.onrender.com/api

## Test Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | admin@securedocs.com | password123 |
| **Owner** | a@gmail.com | 123456 |

##we can create new owner by registering a new user and each user is by default owner

## The Permission Model
Permissions are strictly **Document-to-User**. 
- **Owners** implicitly have full access to any document they upload.
- **Admins** have global read access to all documents to fulfill their compliance oversight role, but they cannot grant/revoke permissions for files they do not own.

## Deliberate Omissions & Design Decisions
1. **No "Delete User" functionality:** I deliberately omitted user deletion. In a strict compliance environment, hard-deleting a user breaks the relational integrity of the immutable `AuditLogs` collection (orphan actor IDs) and creates edge cases with orphaned documents. In production, this would be a "Soft Deactivation" toggle.
2. **No Static File Serving:** Files are saved locally to a hidden `uploads/` directory. They cannot be reached via standard URL paths. Every download is a buffered stream handled by an Express controller that runs a real-time database query to verify authorization.

## Deployment & Setup (Local)
1. Clone the repository.
2. In the `backend` folder, run `npm install`. Create a `.env` file with `PORT=5000`, `MONGO_URI=<your_atlas_string>`, and `JWT_SECRET=<your_secret>`.
3. Run `npm start` in the backend.
4. In the `frontend` folder, run `npm install`, then `npm run dev`.

## API Documentation
*   `POST /api/auth/register` (Public) - Create user.
*   `POST /api/auth/login` (Public) - Authenticate and receive JWT.
*   `POST /api/documents/upload` (Owners/Admins) - Secure file upload.
*   `GET /api/documents` (Logged in users) - Fetch owned and shared documents.
*   `GET /api/documents/download/:id` (Logged in users) - Secure file stream (evaluates permissions in real-time).
*   `POST /api/permissions/grant` (Owners/Admins) - Issue access.
*   `POST /api/permissions/revoke` (Owners/Admins) - Terminate access instantly.
*   `GET /api/audit/document/:id` (Owners/Admins) - View document ledger.
*   `GET /api/audit/system` (Admins strictly) - View global system ledger.
