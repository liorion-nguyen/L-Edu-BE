![Logo](./public/images/auth/logo.png)

![Logo](./public/assets/logo.png)

# L Edu - Nền Tảng Học Lập Trình Toàn Diện

## Mô Tả:

**L Edu** là nền tảng học lập trình dành cho mọi lứa tuổi, từ **Kidteen đến 18+**, giúp người học tiếp cận các khóa học lập trình một cách trực quan và hiệu quả. Website cung cấp nhiều khóa học từ cơ bản đến nâng cao, bao gồm:

- **Lập trình Web** (HTML, CSS, JavaScript, React,...)
- **Lập trình App** (React Native,...)
- **Ngôn ngữ lập trình** (C++, Python, Java,...)

L Edu giúp học viên tiếp cận kiến thức một cách có hệ thống, dễ hiểu thông qua các khóa học được thiết kế chuyên nghiệp bởi các giảng viên giàu kinh nghiệm.

## **Các Tính Năng Chính:**

- **Duyệt và đăng ký khóa học**: Người dùng có thể xem danh sách các khóa học, chi tiết nội dung khóa học, và đăng ký trực tuyến.
- **Tìm kiếm và lọc khóa học**: Hỗ trợ tìm kiếm khóa học theo chủ đề, độ khó và sở thích cá nhân.
- **Hệ thống học tập cá nhân hóa**: Theo dõi tiến trình học tập, đánh giá kết quả học viên.
- **Diễn đàn thảo luận**: Học viên có thể đặt câu hỏi, thảo luận và chia sẻ kinh nghiệm.
- **Hệ thống đánh giá khóa học**: Học viên có thể để lại đánh giá và nhận xét sau khi hoàn thành khóa học.
- **🔐 Đăng nhập đa nền tảng**: Hỗ trợ đăng nhập bằng Google, Facebook, và GitHub OAuth.
- **🎨 Hỗ trợ Dark/Light Theme**: Giao diện tự động thích ứng với thiết lập theme của hệ thống, bao gồm cả nội dung markdown.
- **📖 Markdown Viewer nâng cao**: Hiển thị nội dung markdown với styling đẹp mắt, hỗ trợ syntax highlighting cho code.

## **Tính Năng Đăng Nhập Mới:**

### **🔐 OAuth Authentication**
- **Google Login**: Đăng nhập nhanh chóng bằng tài khoản Google
- **Facebook Login**: Sử dụng tài khoản Facebook để truy cập
- **GitHub Login**: Đăng nhập bằng tài khoản GitHub cho developers
- **Tự động tạo tài khoản**: Hệ thống tự động tạo tài khoản mới cho người dùng OAuth lần đầu
- **Bảo mật cao**: Sử dụng Passport.js và JWT token để đảm bảo an toàn

### **🛡️ Authentication Features**
- **Secure Token Management**: JWT access token và refresh token
- **Session Management**: Tự động gia hạn phiên đăng nhập
- **Unified User Experience**: Trải nghiệm đăng nhập thống nhất cho tất cả các phương thức
- **Profile Integration**: Tự động đồng bộ thông tin từ OAuth providers

## **Tính Năng UI/UX Mới:**

### **🎨 Elegant Design System**
- **Sophisticated Color Palette**: Sử dụng bảng màu indigo/slate tinh tế thay vì teal sáng chói
- **Consistent Design Language**: Hệ thống màu sắc và typography thống nhất trên toàn bộ ứng dụng
- **Refined Shadows**: Giảm thiểu box-shadow để tạo cảm giác nhẹ nhàng và sang trọng hơn
- **Premium Typography**: Font chữ và spacing được tối ưu cho trải nghiệm đọc tốt nhất

### **🌓 Adaptive Theme Support**
- **Tự động phát hiện theme**: Hệ thống tự động phát hiện và áp dụng theme sáng/tối dựa trên thiết lập của người dùng
- **Markdown responsive**: Nội dung markdown tự động chuyển đổi màu sắc phù hợp với theme
- **Syntax highlighting thông minh**: Code blocks sử dụng GitHub theme tương ứng (github/github-dark)

### **💎 Enhanced Styling**
- **Subtle Glassmorphism**: Hiệu ứng kính mờ tinh tế cho các component
- **Elegant Indigo Palette**: Bảng màu indigo/slate sang trọng và dễ chịu
- **Smooth Micro-interactions**: Chuyển đổi mượt mà giữa các trạng thái
- **Responsive Design**: Tối ưu cho mọi kích thước màn hình

### **📝 Markdown Features**
- **Theme-aware colors**: Màu sắc tự động thích ứng với theme
- **Enhanced typography**: Font chữ và spacing được tối ưu
- **Beautiful code blocks**: Syntax highlighting với border và shadow tinh tế
- **Styled tables**: Bảng với border rounded và striped rows
- **Interactive elements**: Links và buttons với hover effects mượt mà

## **Color Palette:**

### **Primary Colors**
```css
/* Elegant Indigo/Slate */
--primary-50: #F8FAFC
--primary-500: #5A67D8 /* Main Primary */
--primary-600: #4C51BF /* Primary Dark */
```

### **Accent Colors**
```css
/* Sophisticated Purple */
--accent-500: #9F7AEA /* Main Accent */
--accent-400: #C084FC /* Light Accent */
```

### **Neutral Colors**
```css
/* Warm Grays */
--neutral-50: #FAFAFA
--neutral-500: #71717A
--neutral-900: #18181B
```

## **Công Nghệ Sử Dụng:**

- **[React](https://reactjs.org/)**: Xây dựng giao diện người dùng nhanh chóng, tối ưu hóa hiệu suất.
- **[NestJS](https://nestjs.com/)** (Node.js): Xây dựng backend mạnh mẽ, linh hoạt với mô hình MVC.
- **[Redux](https://redux.js.org/)**: Quản lý trạng thái toàn cục, giúp đồng bộ dữ liệu hiệu quả.
- **[Ant Design](https://ant.design/)**: Giao diện đẹp mắt, chuyên nghiệp với các thành phần UI mạnh mẽ.
- **[MongoDB](https://www.mongodb.com/)**: Cơ sở dữ liệu NoSQL linh hoạt, phù hợp với dữ liệu động của hệ thống.
- **[Passport.js](https://www.passportjs.org/)**: Xử lý authentication với hỗ trợ OAuth cho Google, Facebook, GitHub.
- **[React Markdown](https://github.com/remarkjs/react-markdown)**: Hiển thị nội dung markdown với syntax highlighting.
- **[Highlight.js](https://highlightjs.org/)**: Syntax highlighting cho code blocks với theme adaptive.

## **[Link Website](https://l-edu.vercel.app/)**

## **Hướng Dẫn Cài Đặt**

### **1. Clone Repository:**
```bash
git clone https://github.com/liorion-nguyen/l-edu.git
cd l-edu
```

### **2. Cài Đặt Dependencies:**
```bash
# Cài đặt frontend
cd frontend
npm install

# Cài đặt backend
cd ../backend
npm install
```

### **3. Cấu Hình Môi Trường:**

#### **🚀 Cách nhanh - Sử dụng Setup Script:**
```bash
# Chạy script tự động tạo file .env
cd backend
./setup-env.sh
```

#### **Backend (.env):**
Tạo file `.env` trong thư mục `backend` và thêm các thông tin sau:

> **⚠️ Lưu ý quan trọng:** Để server có thể khởi động, bạn cần tạo file `.env` với ít nhất các giá trị cơ bản. OAuth sẽ chỉ hoạt động khi bạn cấu hình đúng các client ID và secret thật từ các provider.
```env
# Database
MONGO_URI=your_mongodb_connection

# JWT
JWT_SECRET=your_secret_key

# Server
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# OAuth - Facebook
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
```

#### **Frontend (.env):**
Tạo file `.env` trong thư mục `frontend` và thêm:
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000
```

### **4. Cấu Hình OAuth:**

#### **Google OAuth:**
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google+ API
4. Tạo OAuth 2.0 credentials:
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
   - Authorized JavaScript origins: `http://localhost:3000`

#### **Facebook OAuth:**
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo ứng dụng mới
3. Thêm Facebook Login product
4. Cấu hình Valid OAuth Redirect URIs: `http://localhost:5000/auth/facebook/callback`

#### **GitHub OAuth:**
1. Truy cập [GitHub Developer Settings](https://github.com/settings/developers)
2. Tạo OAuth App mới
3. Cấu hình:
   - Authorization callback URL: `http://localhost:5000/auth/github/callback`
   - Application name: L-Edu

### **5. Chạy Dự Án:**
```bash
# Chạy backend
cd backend
npm run start:dev

# Chạy frontend (terminal mới)
cd frontend
npm start
```

Dự án sẽ chạy trên:
- **Frontend**: `http://localhost:3000/`
- **Backend**: `http://localhost:5000/`
- **OAuth endpoints**: 
  - Google: `http://localhost:5000/auth/google`
  - Facebook: `http://localhost:5000/auth/facebook`
  - GitHub: `http://localhost:5000/auth/github`

---

## **API Endpoints:**

### **Authentication:**
- `POST /auth/login` - Đăng nhập thông thường
- `POST /auth/signup` - Đăng ký tài khoản
- `POST /auth/logout` - Đăng xuất
- `POST /auth/refresh-token` - Làm mới token

### **OAuth Authentication:**
- `GET /auth/google` - Khởi tạo Google OAuth
- `GET /auth/google/callback` - Xử lý callback từ Google
- `GET /auth/facebook` - Khởi tạo Facebook OAuth
- `GET /auth/facebook/callback` - Xử lý callback từ Facebook
- `GET /auth/github` - Khởi tạo GitHub OAuth
- `GET /auth/github/callback` - Xử lý callback từ GitHub

## **Curl Commands để Test API:**

### **1. Đăng ký tài khoản:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "fullName": "Test User"
  }'
```

### **2. Đăng nhập thông thường:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

### **3. Lấy thông tin user (cần access token):**
```bash
curl -X GET http://localhost:5000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **4. Refresh token:**
```bash
curl -X POST http://localhost:5000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### **5. Đăng xuất:**
```bash
curl -X POST http://localhost:5000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### **6. Khởi tạo OAuth (mở trong browser):**
```bash
# Google OAuth
curl -X GET http://localhost:5000/auth/google

# Facebook OAuth  
curl -X GET http://localhost:5000/auth/facebook

# GitHub OAuth
curl -X GET http://localhost:5000/auth/github
```

### **7. Test các endpoint khác:**

#### **Lấy danh sách khóa học:**
```bash
curl -X GET http://localhost:5000/courses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **Tạo khóa học mới:**
```bash
curl -X POST http://localhost:5000/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Khóa học mới",
    "description": "Mô tả khóa học",
    "price": 100000,
    "level": "BEGINNER"
  }'
```

#### **Lấy thông tin chat rooms:**
```bash
curl -X GET http://localhost:5000/chat-room \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **Tạo chat room mới:**
```bash
curl -X POST http://localhost:5000/chat-room \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Chat Room Test",
    "description": "Phòng chat test"
  }'
```

### **8. Postman Collection:**

#### **Environment Variables trong Postman:**
```json
{
  "base_url": "http://localhost:5000",
  "access_token": "{{access_token}}",
  "refresh_token": "{{refresh_token}}"
}
```

#### **Pre-request Script để tự động set token:**
```javascript
// Trong Pre-request Script của Postman
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('access_token')
});
```

#### **Test Script để lưu token:**
```javascript
// Trong Test Script của login endpoint
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data) {
        pm.environment.set('access_token', response.data.access_token);
        pm.environment.set('refresh_token', response.data.refresh_token);
    }
}
```

### **9. Response Examples:**

#### **Successful Login Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  },
  "message": "Success"
}
```

#### **Error Response:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid email or password"
}
```

#### **User Profile Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb54b0c7c001f5a2d8a",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "STUDENT",
    "status": "ACTIVE",
    "avatar": "https://example.com/avatar.jpg",
    "provider": "local",
    "createdAt": "2021-06-25T10:30:00.000Z"
  }
}
```

### **10. Common HTTP Status Codes:**
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## **🔧 Troubleshooting:**

### **🚀 Quick Setup (Khắc phục tất cả lỗi phổ biến):**

```bash
# 1. Tạo environment và khởi động MongoDB
./setup-env.sh

# 2. Cài đặt dependencies
pnpm install

# 3. Khởi động server
npm run start:dev

# 4. Test server (terminal mới)
./test-server.sh
```

### **Lỗi "OAuth2Strategy requires a clientID option":**
Đây là lỗi phổ biến khi server không thể tìm thấy environment variables cho OAuth. Để sửa:

1. **Tạo file `.env`** trong thư mục `backend`:
```bash
# Tạo file .env với dummy values để server khởi động được
cp .env.example .env
```

2. **Hoặc tạo file `.env` thủ công** với nội dung:
```env
# Database
MONGO_URI=mongodb://localhost:27017/l-edu
JWT_SECRET=your-super-secret-jwt-key-here-12345
PORT=5000
FRONTEND_URL=http://localhost:3000

# OAuth (dummy values for development)
GOOGLE_CLIENT_ID=dummy-google-client-id
GOOGLE_CLIENT_SECRET=dummy-google-client-secret
FACEBOOK_CLIENT_ID=dummy-facebook-client-id
FACEBOOK_CLIENT_SECRET=dummy-facebook-client-secret
GITHUB_CLIENT_ID=dummy-github-client-id
GITHUB_CLIENT_SECRET=dummy-github-client-secret
```

3. **Thay thế bằng giá trị thật** khi muốn sử dụng OAuth:
   - OAuth endpoints sẽ trả về lỗi `BadRequestException` nếu phát hiện dummy values
   - Server sẽ khởi động bình thường nhưng OAuth sẽ không hoạt động cho đến khi có config thật

### **Lỗi kết nối MongoDB:**

**🔍 Kiểm tra lỗi:** `The 'uri' parameter to 'openUri()' must be a string, got "undefined"`

**Nguyên nhân:** 
1. File `.env` không được tạo hoặc biến `MONGO_URI` không đúng
2. MongoDB service không chạy
3. Tên biến environment không khớp trong code

**✅ Cách sửa:**

1. **Tạo/kiểm tra file .env:**
```bash
# Kiểm tra file .env có tồn tại không
ls -la .env

# Kiểm tra nội dung MONGO_URI
grep MONGO_URI .env
```

2. **Khởi động MongoDB:**
```bash
# Với Homebrew (macOS)
brew services start mongodb-community

# Với apt (Ubuntu/Debian)
sudo systemctl start mongod

# Kiểm tra MongoDB đã chạy chưa
brew services list | grep mongodb
```

3. **Hoặc sử dụng MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/l-edu?retryWrites=true&w=majority
```

4. **Kiểm tra connection:**
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/l-edu"
```

### **Lỗi Port đã được sử dụng:**
```bash
# Tìm và kill process đang sử dụng port 5000
lsof -ti:5000 | xargs kill -9

# Hoặc đổi port trong .env
PORT=3001
```

### **Kiểm tra cấu hình OAuth:**
```bash
# Test OAuth endpoint - sẽ trả về lỗi nếu chưa cấu hình
curl -X GET http://localhost:5000/auth/google
```

### **Server không phản hồi (No response):**

**🔍 Kiểm tra:** Server khởi động nhưng không trả về response

**✅ Cách sửa:**

1. **Kiểm tra logs server:**
```bash
# Xem logs trong terminal đang chạy server
# Tìm lỗi như missing dependencies, configuration issues

# Hoặc chạy với debug mode
npm run start:debug
```

2. **Kiểm tra dependencies:**
```bash
# Cài đặt lại dependencies
npm install

# Hoặc dùng pnpm (nếu có pnpm-lock.yaml)
pnpm install
```

3. **Test từng bước:**
```bash
# 1. Kiểm tra server process
ps aux | grep nest

# 2. Kiểm tra port có bị chiếm không
lsof -i :5000

# 3. Test health endpoint
curl -v http://localhost:5000/health

# 4. Test root endpoint
curl -v http://localhost:5000
```

4. **Restart hoàn toàn:**
```bash
# Kill tất cả process node
killall node

# Restart MongoDB
brew services restart mongodb-community

# Chạy lại server
npm run start:dev
```

5. **Sử dụng test script:**
```bash
# Chạy script test tự động
./test-server.sh
```

## **Design System**

### **Color Constants**
Hệ thống sử dụng color constants để đảm bảo tính nhất quán:

```typescript
// src/constants/colors.ts
export const COLORS = {
  primary: {
    500: '#5A67D8', // Main primary color
    400: '#667EEA', // Hover state
    600: '#4C51BF', // Active state
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    heading: '#111827',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F4F4F5',
  }
}
```

### **Shadow System**
```typescript
export const SHADOWS = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.08)',
}
```

### **Responsive Breakpoints**
```css
/* Mobile */
@media (max-width: 768px) {
  /* Mobile-specific styles */
}

/* Tablet and Desktop */
@media (min-width: 769px) {
  /* Larger screen styles */
}
```

## **Architecture**

### **Component Structure**
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components
│   └── sections/        # Page sections
├── constants/
│   └── colors.ts        # Color system constants
├── theme.ts             # Ant Design theme configuration
└── pages/               # Page components
```

### **Authentication Flow**
```
1. User clicks OAuth provider button
2. Frontend redirects to backend OAuth endpoint
3. Backend redirects to OAuth provider
4. User authorizes on provider
5. Provider redirects back to backend callback
6. Backend processes OAuth response
7. Backend redirects to frontend with tokens
8. Frontend stores tokens and fetches user data
```

### **Theme Configuration**
- **Consistent Design Tokens**: Centralized color, spacing, and typography tokens
- **Component Theming**: Customized Ant Design components with brand colors
- **Dark Mode Support**: Automatic theme switching based on system preference

## **Bảo Mật:**

- **JWT Token**: Sử dụng JWT cho authentication và authorization
- **Refresh Token**: Tự động gia hạn phiên đăng nhập
- **OAuth 2.0**: Đăng nhập an toàn qua các provider lớn
- **CORS**: Cấu hình CORS để bảo vệ API
- **Input Validation**: Kiểm tra và validate tất cả input từ người dùng

## **Đóng Góp**
Nếu bạn muốn đóng góp vào dự án, vui lòng tạo Pull Request hoặc liên hệ với chúng tôi qua email: **ledu.support@gmail.com**.

## **Liên Hệ**
📍 **Địa chỉ:** Hà Nội, Việt Nam  
📧 **Email:** liorion.nguyen@gmail.com  
📞 **Điện thoại:** (+84) 708-200-334

---

### **Changelog**
- **v2.1.0**: OAuth Authentication Support
  - Added Google, Facebook, and GitHub OAuth login
  - Integrated Passport.js for authentication
  - Enhanced user experience with one-click login
  - Automatic account creation for OAuth users
  - Secure token management with JWT

- **v2.0.0**: Elegant Design System
  - Refined color palette with indigo/slate tones
  - Reduced shadow intensity for softer appearance
  - Enhanced typography and spacing
  - Improved dark mode support
  - Centralized color constants system

Cảm ơn bạn đã quan tâm đến **L Edu**! 🚀