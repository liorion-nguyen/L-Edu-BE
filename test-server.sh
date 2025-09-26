#!/bin/bash

echo "🧪 Testing L-Edu Backend API..."

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test server health
echo ""
echo "1. Testing server health..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null)
if [ "$response" = "200" ]; then
    echo "✅ Server is running (HTTP $response)"
    health_data=$(curl -s http://localhost:5000/health 2>/dev/null)
    echo "   Health response: $health_data"
else
    echo "❌ Server not responding (HTTP $response)"
    echo "   Trying root endpoint..."
    root_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 2>/dev/null)
    if [ "$root_response" = "200" ] || [ "$root_response" = "403" ]; then
        echo "   Root endpoint responds with HTTP $root_response (server is running)"
    else
        echo "   Root endpoint also not responding (HTTP $root_response)"
        exit 1
    fi
fi

# Test signup endpoint
echo ""
echo "2. Testing signup endpoint..."
signup_response=$(curl -s -X POST http://localhost:5000/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "123456", "fullName": "Test User"}' 2>/dev/null)

if echo "$signup_response" | grep -q "success\|error\|message"; then
    echo "✅ Signup endpoint responding"
    echo "Response: $signup_response" | head -c 100
else
    echo "❌ Signup endpoint not responding properly"
fi

# Test OAuth endpoint validation
echo ""
echo "3. Testing OAuth validation..."
oauth_response=$(curl -s http://localhost:5000/auth/google 2>/dev/null)
if echo "$oauth_response" | grep -q "not configured\|BadRequest"; then
    echo "✅ OAuth validation working (properly rejecting dummy config)"
else
    echo "⚠️  OAuth response: $oauth_response" | head -c 100
fi

echo ""
echo "🎉 API testing completed!"
echo ""
echo "📝 Next steps:"
echo "1. Use the curl commands in README.md to test specific endpoints"
echo "2. Set up real OAuth credentials when needed"
echo "3. Create some test data and start building!" 