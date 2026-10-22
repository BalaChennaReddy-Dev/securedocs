# Threat Model & Vulnerability Assessment

### 1. Direct Object Reference (Unauthorized File Access)
*   **The Threat:** An attacker guesses the storage path of a physical file (e.g., `uploads/12345.png`) and downloads it via the browser, bypassing the UI.
*   **Mitigation:** The `uploads` directory is completely hidden from Express's static router. The only way to retrieve a file is via `GET /api/documents/download/:id`. The server parses the JWT, queries the `Permissions` and `Documents` collections, and blocks the request (403) if authorization is missing.

### 2. Privilege Escalation (Viewer mutating state)
*   **The Threat:** A 'Viewer' intercepts their JWT, realizes it works, and uses a tool like Postman to send a POST request to `/api/permissions/grant` to give themselves access to a file.
*   **Mitigation:** The `requireRole(['Owner', 'Admin'])` middleware sits in front of sensitive routes. The server extracts the role directly from the cryptographically signed JWT payload; a Viewer cannot forge an Owner token without the server's `.env` secret.

### 3. Audit Trail Tampering
*   **The Threat:** A compromised Admin account attempts to delete the log showing an unauthorized file access.
*   **Mitigation:** The `AuditLogs` MongoDB schema has `updatedAt: false` and there are strictly no `PUT` or `DELETE` endpoints created for the audit router. It is an append-only ledger.

### 4. Ephemeral Storage Data Loss (Accepted Risk)
*   **The Threat:** Because the backend is deployed on Render's free tier, the server spins down during inactivity. This destroys the local file system (`uploads/` folder), resulting in orphaned database records where the metadata exists but the physical file is gone.
*   **Why I Accepted It:** This is a constraint of free hackathon hosting. In a production environment, the `documentController` would use the `aws-sdk` to pipe Multer streams directly into a private Amazon S3 bucket, completely separating file storage from the ephemeral compute instance.

### 5. Denial of Service via Unrestricted Uploads (Accepted Risk)
*   **The Threat:** A malicious user uploads a 50GB file, crashing the server's memory or filling the disk.
*   **Why I Accepted It:** Due to the 7-day time constraint, I prioritized strict read-access authorization. Multer does not currently have file size limits configured. In production, I would add `limits: { fileSize: 1024 * 1024 * 5 }` to the Multer config.