# Google OAuth Setup Guide

## Backend Configuration

### 1. Environment Variables
Thêm các biến môi trường sau vào file `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Frontend URL
URL_CLIENT=http://localhost:3000
```

### 2. Google Cloud Console Setup

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Kích hoạt Google+ API
4. Tạo OAuth 2.0 credentials:
   - Vào "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
   - Lưu Client ID và Client Secret

### 3. Install Dependencies

```bash
cd L-Edu-BE
pnpm install passport-google-oauth20 @types/passport-google-oauth20
```

## Frontend Configuration

### 1. Environment Variables
Thêm vào file `.env` của frontend:

```env
REACT_APP_API_URL=http://localhost:5000
```

## How It Works

1. User clicks "Đăng nhập bằng Google" button
2. Frontend redirects to `/auth/google` endpoint
3. Backend redirects to Google OAuth consent screen
4. User authorizes the application
5. Google redirects back to `/auth/google/callback`
6. Backend processes the Google user info:
   - If user exists: updates googleId if needed
   - If user doesn't exist: creates new user with status ACTIVE
7. Backend generates JWT token and redirects to frontend callback page
8. Frontend receives token and stores it in localStorage
9. User is logged in and redirected to home page

## Features

- ✅ Automatic user creation from Google profile
- ✅ Status set to ACTIVE by default for Google users
- ✅ Existing users can link their Google account
- ✅ Seamless login experience
- ✅ Error handling and user feedback

## Testing

1. Start backend: `npm run start:dev`
2. Start frontend: `npm start`
3. Go to login page and click Google login button
4. Complete Google OAuth flow
5. Verify user is created/logged in successfully
