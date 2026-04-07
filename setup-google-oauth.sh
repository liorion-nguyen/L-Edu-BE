#!/bin/bash

echo "🚀 Setting up Google OAuth for CodeLab..."

# Navigate to backend directory
cd L-Edu-BE

echo "📦 Installing dependencies..."
pnpm install passport-google-oauth20 @types/passport-google-oauth20

echo "🔧 Updating lockfile..."
pnpm install --no-frozen-lockfile

echo "✅ Dependencies installed successfully!"

echo ""
echo "📋 Next steps:"
echo "1. Set up Google Cloud Console credentials"
echo "2. Add environment variables to .env file:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET" 
echo "   - GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback"
echo "   - URL_CLIENT=http://localhost:3000"
echo ""
echo "3. Start the backend server:"
echo "   npm run start:dev"
echo ""
echo "4. Test Google login on frontend"
echo ""
echo "📖 See GOOGLE_OAUTH_SETUP.md for detailed instructions"
