# AI Collaboration Log

**Date: Oct 21, 2026**
*   **Prompt:** "Create a MERN stack setup guide for TrustVault with strict role-based schemas (Admin, Owner, Viewer)."
*   **AI Output:** Provided standard Express setup and Mongoose schemas for User, Document, Permission, and AuditLog.
*   **What was wrong:** The AI missed adding `.env` and `uploads/` to the `.gitignore` step, which is a critical security flaw.
*   **What I did instead:** Manually created the `.gitignore` to ensure database credentials and local user files are never committed to version control. [INSERT COMMIT LINK]

**Date: Oct 21, 2026** (Auth/Database Issue)
*   **Prompt:** "MongoDB Connection Error: querySrv ECONNREFUSED. How do I fix this ISP block for Atlas?"
*   **AI Output:** Suggested changing to Google DNS, then suggested using the legacy `mongodb://` direct shard IP string.
*   **What was wrong:** Modifying the direct shard string caused authentication failures due to strict network configurations on my ISP blocking port 27017 entirely.
*   **What I did instead:** Implemented Cloudflare WARP to encrypt DNS and bypass the ISP port block entirely, allowing the modern `mongodb+srv://` protocol to connect securely. [INSERT COMMIT LINK]

**Date: Oct 22, 2026** (File Upload Setup)
*   **Prompt:** "Write the Multer controller for secure file uploads that doesn't expose the public directory."
*   **AI Output:** Wrote the Express controller and tested it via Thunder Client.
*   **What was wrong:** The AI's Thunder Client testing instructions caused a `MulterError: Unexpected file field`. 
*   **What I did instead:** Identified that the frontend form-data key must strictly match the `upload.single('file')` backend configuration. Fixed the API testing parameters to successfully route the binary data. [INSERT COMMIT LINK]

**Date: Oct 22, 2026** (Access Control & Token Validation)
*   **Prompt:** "I am getting a 403 Forbidden 'Invalid or expired token' error when passing my JWT in Thunder Client headers."
*   **AI Output:** The AI suggested the token string was malformed and advised using the "Bearer" tab instead of the "OAuth 2" tab.
*   **What was wrong:** While the tab change was correct, the AI didn't account for invisible whitespace characters injected by PowerShell when copying the token.
*   **What I did instead:** Bypassed terminal copy-pasting entirely. Wrote an isolated JSON POST request in the API client to generate and copy a clean JWT, passing the authorization middleware. [INSERT COMMIT LINK]

**Date: Oct 22, 2026** (Automated Security Testing)
*   **Prompt:** "Write a Jest/Supertest script that proves a Viewer cannot download a document without explicit permission."
*   **AI Output:** Generated a test that logged in as a Viewer, sent a revoke permission request to clear the slate, and then attempted to download the file.
*   **What was wrong:** The test failed by returning `200 OK` instead of `403`. The AI's test design tried to have the *Viewer* revoke their own access via the API, which my `requireRole(['Owner', 'Admin'])` middleware correctly blocked. The slate was never cleared.
*   **What I did instead:** Rewrote the test setup block to bypass the API and execute a direct database wipe (`Permission.deleteMany()`) for the test user, ensuring a true zero-permission isolated environment for the test assertion. [INSERT COMMIT LINK]