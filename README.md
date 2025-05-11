# Grievance Redressal System Backend

This is the backend API for the Grievance Redressal System, built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login)
- JWT-based authentication
- Grievance management (create, read, update)
- File upload support
- Role-based access control
- Comment system for grievances

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8080
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=24h
   ```
4. Create an `uploads` directory in the root folder:
   ```bash
   mkdir uploads
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ name, email, password, studentId, department }`
  - Returns: JWT token and user data

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: JWT token and user data

- `GET /api/auth/me` - Get current user
  - Headers: `Authorization: Bearer <token>`
  - Returns: User data

### Grievances

- `GET /api/grievances` - Get all grievances
  - Headers: `Authorization: Bearer <token>`
  - Query params: `status`, `category`, `priority`, `sort`
  - Returns: List of grievances

- `POST /api/grievances` - Create new grievance
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title, description, category, priority }`
  - Files: `attachments` (optional, max 5 files)
  - Returns: Created grievance

- `GET /api/grievances/:id` - Get single grievance
  - Headers: `Authorization: Bearer <token>`
  - Returns: Grievance details

- `PUT /api/grievances/:id` - Update grievance
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title, description, category, priority, status }`
  - Files: `attachments` (optional, max 5 files)
  - Returns: Updated grievance

- `POST /api/grievances/:id/comments` - Add comment to grievance
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ text }`
  - Returns: Updated grievance with new comment

## File Upload

The API supports file uploads for grievance attachments. Supported file types:
- Images (JPEG, JPG, PNG)
- Documents (PDF, DOC, DOCX)

Maximum file size: 10MB
Maximum number of files per grievance: 5

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- File uploads are validated for type and size
- Role-based access control for sensitive operations 