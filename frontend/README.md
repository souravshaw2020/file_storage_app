# Secure File Storage Application

A full-stack, secure file management platform that allows authenticated users to upload, organize, and share files. Built with a **Next.js** frontend, a **NestJS** backend, **PostgreSQL** (via Prisma), and **AWS S3** for scalable cloud storage.

## 🚀 Features

*   **Authentication:** Secure, HttpOnly cookie-based authentication.
*   **Direct-to-Cloud Uploads:** Upload files up to 100MB directly from the browser to AWS S3 using presigned URLs.
*   **Access Control:** Files are private by default and strictly guarded by the backend.
*   **File Sharing:** Toggle files to "Public" to generate shareable links for unauthenticated access.
*   **Clean UI:** Custom CSS modules with a responsive, soft UI design (Emoji-free, Tailwind-free).

---

## 🛠 Tech Stack

*   **Frontend:** Next.js (App Router), React, Axios, Lucide React, React Hot Toast
*   **Backend:** NestJS, TypeScript, AWS SDK (v3)
*   **Database:** PostgreSQL, Prisma ORM
*   **Storage:** AWS S3

---

## ☁️ AWS Configuration

Before running the application, you need to configure your AWS environment.

### 1. S3 Bucket Setup
1. **Create a new S3 bucket** (e.g., `my-secure-file-bucket`).
2. **Block Public Access:** Ensure "Block all public access" is **turned on**. The application uses secure signed URLs, so the bucket itself should remain completely private.
3. **CORS Configuration:** Since the frontend uploads files directly to S3 via a `PUT` request, you must configure CORS on the bucket:
   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["PUT", "GET"],
           "AllowedOrigins": ["http://localhost:3001"], 
           "ExposeHeaders": []
       }
   ]

###  2. IAM User Setup
1. **Create an IAM User in the AWS Console.**
2. *Attach an inline policy with the following permissions:*

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}

3. **Generate an Access Key ID and Secret Access Key for this user.**

###  3. Backend Setup (NEST JS)
1. *Installation*
## Navigate to the backend directory and install dependencies:

cd backend
npm install

2. *Environment Variables*
## Create a .env file in the backend/ directory:

# Server
*PORT*=3000
*FRONTEND_URL*=http://localhost:3001

# Database (PostgreSQL)
*DATABASE_URL="postgresql://user:password@localhost:5432/file_storage?schema=public"*

# AWS S3 Configuration
*AWS_REGION*=us-east-1
*AWS_ACCESS_KEY_ID*=your_access_key
*AWS_SECRET_ACCESS_KEY*=your_secret_key
*AWS_S3_BUCKET_NAME*=your_bucket_name

# Authentication (If using JWT internally)
**Command -** node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
*JWT_SECRET*=your_super_secret_string

### 4. *Prisma Database Configuration*
**Initialize your PostgreSQL database with Prisma:**

# Generate the Prisma Client
npx prisma generate

# Push the schema to your database (for initial setup/prototyping)
npx prisma db push

# OR: Create a migration (for production workflows)
npx prisma migrate dev --name init

### 5. Start the Server

npm run start:dev


###  6. Frontend Setup (Next.js)

1. *Installation*
**Navigate to the frontend directory and install dependencies:**

cd frontend
npm install

2. *Environment Variables*
**Create a .env file in the frontend/ directory:**

*NEXT_PUBLIC_API_URL*=http://localhost:3000

3. *Start the Client*

npm run dev


### 5. API Reference
#### Backend Endpoints (NestJS)

## Authentication (/auth)

1. *POST /auth/register* - Register a new user (Body: { email, password }).

2. *POST /auth/login* - Authenticate and set HttpOnly cookie (Body: { email, password }).

3. *POST /auth/logout* - Clear the HttpOnly authentication cookie.

## File Management (/files)

1. *POST /files/upload-url* (Auth Required) - Generate an S3 presigned URL for direct uploading.

2. *POST /files/confirm* (Auth Required) - Save file metadata to the database after successful S3 upload.

3. *GET /files/dashboard* (Auth Required) - Fetch all files owned by the authenticated user.

4. *GET /files/:id/download* (Auth Required) - Generate a short-lived download link for a private file.

5. *PATCH /files/:id/access* (Auth Required) - Toggle a file's isPublic status.

6. *GET /files/share/:id* (Public) - Get a download link for a file (succeeds only if isPublic is true).

#### Frontend API Client (Axios)

The frontend maps to these endpoints using an Axios instance configured with withCredentials: true to handle cookies automatically.

## 1. AuthAPI

AuthAPI.register(credentials)
AuthAPI.login(credentials)
AuthAPI.logout()

## 2. FileAPI

FileAPI.getDashboardFiles()
FileAPI.getUploadUrl(fileData)
FileAPI.confirmUpload(metadata)
FileAPI.getDownloadUrl(fileId)
FileAPI.toggleAccess(fileId, isPublic)
FileAPI.getSharedFile(fileId) // Public access route
