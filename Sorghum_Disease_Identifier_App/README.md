# Mango Disease Identifier App

A React Native mobile application designed to help farmers identify diseases in mango plants using machine learning.

## Features

### Core Features
- Disease identification through camera or gallery images
- Comprehensive database of common mango diseases with treatment information
- Weather reports for local conditions
- Multi-language support (English, Amharic, and Oromo)

### Recent Improvements

#### UI/UX Enhancements
- Improved disease identification screen with result displays
- Added comprehensive mango disease information screen
- Enhanced visual elements throughout the app
- Added loading states during image processing

#### Offline Functionality
- Local storage for disease identifications
- Offline capability for image analysis
- Background synchronization when online
- Cache for disease information and treatments

#### Data Collection
- Disease reporting system with location data
- Severity classification
- Environmental conditions reporting
- Age of tree reporting

#### User Experience
- Complete "Mango Disease" screen showing common diseases with detailed information
- Integrated navigation between identification and reporting
- Enhanced profile capabilities
- Added educational content about mango diseases

## Technical Details

### Tech Stack
- React Native / Expo
- React Navigation for screen management
- Async Storage for offline data persistence
- NetInfo for network connectivity monitoring
- Expo Image Picker for capturing and selecting images
- i18n for localization

### State Management
- Context API for offline state management
- Local component state for UI interactions

### Data Flow
1. Users capture or select images of mango plants
2. Images are processed locally or sent to the backend ML model
3. Identified diseases are displayed with confidence scores
4. Users can save results or report diseases with additional information
5. Data is synced with the server when online

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
cd Mango_Disease_Identifier_App
npm install

# Start the development server
npm start
```

## Backend Requirements
The app is ready to connect to a backend service that provides:
- Disease identification API
- User authentication
- Data synchronization for offline reports
- Weather data integration

## Next Steps for Development
- Create or integrate ML model for disease classification
- Add user account management with secure storage
- Implement push notifications for disease outbreaks
- Add analytics dashboard for tracking disease patterns 