# Sorghum Disease Identifier App - Backend

This is the backend API for the Sorghum Disease Identifier application, built with Flask and MongoDB.

## Setup Instructions

### Prerequisites
- Python 3.7+
- MongoDB (or MongoDB Atlas account)
- Gmail account (for sending emails)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Sorghum_Disease_Identifier_App/backend
```

2. Create and activate a virtual environment
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with the following environment variables:
```
# MongoDB connection string
MONGO_URI="your_mongodb_connection_string"

# JWT configuration
JWT_SECRET_KEY="your_secret_key"

# Flask configuration
FLASK_DEBUG=True
PORT=5000

# Email configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_gmail@gmail.com
```

> **Note**: For Gmail, you need to create an App Password. Go to your Google Account > Security > 2-Step Verification > App passwords.

5. Run the application
```bash
python app.py
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Authentication Routes

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|-------------|
| `/api/auth/signup` | POST | Register a new user | `{"email": "user@example.com", "password": "password", "name": "User Name"}` |
| `/api/auth/verify-otp` | POST | Verify OTP for email verification | `{"email": "user@example.com", "otp": "123456"}` |
| `/api/auth/login` | POST | Login a user | `{"email": "user@example.com", "password": "password"}` |
| `/api/auth/resend-otp` | POST | Resend OTP for email verification | `{"email": "user@example.com"}` |
| `/api/auth/forgot-password` | POST | Send password reset OTP | `{"email": "user@example.com"}` |
| `/api/auth/reset-password` | POST | Reset password with OTP | `{"email": "user@example.com", "otp": "123456", "new_password": "new_password"}` |
| `/api/auth/me` | GET | Get current user profile | Requires Authorization header |

### User Routes

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|-------------|
| `/api/users/profile` | GET | Get user profile | Requires Authorization header |
| `/api/users/profile` | PUT | Update user profile | `{"name": "New Name"}` |
| `/api/users/change-password` | POST | Change user password | `{"current_password": "current", "new_password": "new"}` |

### Database Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/db-status` | GET | Check MongoDB connection |

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

The token is obtained after successful login or email verification.

## Error Handling

All endpoints return JSON responses with the following structure:
```json
{
  "success": true/false,
  "message": "Success or error message",
  "data": {...}  // Optional data
}
```

HTTP status codes are used to indicate the result of the request. 