#!/bin/bash

# L-Edu Backend Environment Setup Script
echo "🚀 Setting up L-Edu Backend Environment..."

# Create .env file with dummy values for development
cat > .env << 'EOF'
# Database
MONGO_URI=mongodb://localhost:27017/l-edu

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-12345

# Server
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# OAuth - Google (Replace with real values)
GOOGLE_CLIENT_ID=dummy-google-client-id
GOOGLE_CLIENT_SECRET=dummy-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# OAuth - Facebook (Replace with real values)
FACEBOOK_CLIENT_ID=dummy-facebook-client-id
FACEBOOK_CLIENT_SECRET=dummy-facebook-client-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback

# OAuth - GitHub (Replace with real values)
GITHUB_CLIENT_ID=dummy-github-client-id
GITHUB_CLIENT_SECRET=dummy-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🚀 Starting MongoDB service..."
if command -v brew >/dev/null 2>&1; then
    brew services start mongodb-community >/dev/null 2>&1 && echo "✅ MongoDB started successfully" || echo "⚠️  MongoDB service not found or already running"
elif command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start mongod >/dev/null 2>&1 && echo "✅ MongoDB started successfully" || echo "⚠️  MongoDB service not found or already running"
else
    echo "⚠️  Please start MongoDB manually: mongod"
fi
echo ""
echo "⚠️  IMPORTANT: To use OAuth features, you need to:"
echo "1. Set up OAuth applications on Google Cloud, Facebook Developers, and GitHub"
echo "2. Replace dummy values with real Client IDs and Secrets"
echo "3. Update the callback URLs in your OAuth app settings"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Run 'npm run start:dev' to start the server"
echo "3. Configure OAuth when needed"
echo ""
echo "🔗 OAuth Setup Links:"
echo "- Google: https://console.cloud.google.com/"
echo "- Facebook: https://developers.facebook.com/"
echo "- GitHub: https://github.com/settings/developers"
echo ""
echo "✨ Server should now start without OAuth errors!" 