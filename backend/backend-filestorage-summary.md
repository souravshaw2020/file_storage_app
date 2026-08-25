# Secure File Storage System - Backend Architecture Summary

## Overview
A production-ready, highly secure REST API designed for managing and sharing large files (100MB+). Built with **NestJS**, **PostgreSQL**, and **AWS S3**, the architecture prioritizes memory efficiency, strict authorization, and data integrity.

## Tech Stack
*   **Framework:** NestJS (v11) with TypeScript.
*   **Database:** PostgreSQL managed via Prisma ORM.
*   **Storage:** AWS S3 (for direct-to-cloud file uploads).
*   **Security:** `bcrypt` for password hashing, JWTs for stateless sessions, and `class-validator` for strict boundary validation.

---

## 1. Database Schema
The database uses a clean relational model ensuring data consistency and strict ownership.

*   **Users:** Stores authenticated identities (`id`, `email`, `passwordHash`).
*   **Files:** Stores metadata and access controls (`id`, `ownerId`, `originalName`, `storageKey`, `sizeBytes`, `isPublic`). 
    *   *Security Note:* Uses UUIDs for the `id` to prevent malicious actors from iterating through or guessing sequential file IDs.

---

## 2. Authentication & Authorization
Security is implemented using a multi-layered approach:

*   **Authentication (AuthModule):** Handles user registration and login. Passwords are salted and hashed using `bcrypt`. Successful logins issue a signed JSON Web Token (JWT).
*   **Authorization (AuthGuard):** A global custom guard intercepts incoming requests. It cryptographically verifies the JWT, extracts the user payload, and attaches it to the request object. If the token is missing or invalid, the request is immediately rejected with a `401 Unauthorized`.
*   **Ownership Verification:** For file modifications and private downloads, the application explicitly checks that the `userId` in the JWT matches the `ownerId` of the file record in the database.

---

## 3. Large File Architecture (Direct-to-S3)
To handle files larger than 100MB without crashing the Node.js server, the system implements a **Pre-signed URL flow**. The backend never touches the file bytes.

1.  **Request:** The authenticated client requests an upload link, providing file size and type. The backend validates these constraints.
2.  **Sign:** The backend generates a secure, temporary (15-minute) S3 Pre-signed URL using the AWS SDK.
3.  **Upload:** The client uploads the file *directly* to AWS S3.
4.  **Confirm:** Once uploaded, the client notifies the backend, which saves the file metadata and ownership details into PostgreSQL.

---

## 4. API Endpoints

### Authentication
*   `POST /auth/register` - Creates a new user.
*   `POST /auth/login` - Authenticates a user and returns a JWT.

### File Management (Protected via AuthGuard)
*   `GET /files` - Lists all files owned by the authenticated user (Dashboard).
*   `POST /files/upload-url` - Generates a secure, temporary AWS S3 upload link.
*   `POST /files/confirm` - Confirms an upload and saves metadata to the database.
*   `PATCH /files/:id/access` - Toggles a file's visibility between public and private.
*   `GET /files/:id/download` - Generates a secure S3 download link for the owner.

### Public Access
*   `GET /public/files/:id/download` - Generates a download link *only* if the requested file is flagged as `isPublic = true` in the database.
