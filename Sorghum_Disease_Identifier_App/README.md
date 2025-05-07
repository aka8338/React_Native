# Sorghum Disease Identifier App

A comprehensive mobile application for identifying diseases in sorghum plants using image recognition, with secure user authentication and data management.

## Project Structure

This project is divided into two main parts:

1. **Frontend**: A React Native mobile application
2. **Backend**: A Flask API with MongoDB database

## Features

- User authentication (signup, login, email verification)
- Email-based OTP verification
- Password reset functionality
- Disease identification via image upload
- Offline mode support
- Multi-language support
- Light/dark theme toggle
- Comprehensive disease information database
- User profile and history management

## Technologies Used

### Frontend
- React Native
- Expo
- React Navigation
- i18next (internationalization)
- AsyncStorage
- Axios

### Backend
- Flask
- MongoDB
- JWT Authentication
- Flask-Mail for email services

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory
   ```
   cd Sorghum_Disease_Identifier_App/backend
   ```

2. Install dependencies
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file based on the env_sample file
   - Set up MongoDB connection
   - Configure email settings
   - Set JWT secrets

4. Run the Flask server
   ```
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```
   cd Sorghum_Disease_Identifier_App/frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Update the API base URL in `src/services/api.js` to match your backend location

4. Run the app
   ```
   npm start
   ```

## User Flow

1. **Authentication**:
   - User registers with email and password
   - Verification code sent to email
   - User verifies account with OTP
   - User can log in with verified credentials

2. **Main Application**:
   - Home screen with recent reports and quick access to features
   - Identification screen for capturing or uploading images
   - Disease information library
   - Report history and statistics
   - User profile management

## Data Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Email verification for new accounts
- OTP expiry for security
- HTTPS recommended for production

## Deployment Considerations

- Use a production-ready web server like Gunicorn for the backend
- Configure MongoDB with proper authentication
- Set up HTTPS for all API communication
- Use environment variables for sensitive information
- Consider containerization with Docker for easier deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 