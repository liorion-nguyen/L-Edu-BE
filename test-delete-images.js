// Test script để kiểm tra chức năng xóa ảnh từ Cloudinary
const fetch = require('node-fetch');

async function testDeleteImages() {
  const testUrls = [
    'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/test-image.jpg',
    // Thêm URL ảnh thật từ Cloudinary của bạn
  ];

  try {
    const response = await fetch('http://localhost:8000/chat/test-delete-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      },
      body: JSON.stringify({ urls: testUrls })
    });

    const result = await response.json();
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Chạy test
testDeleteImages();
