# Google OAuth Avatar Integration - Test Cases

## 🎯 Test Scenarios

### Scenario 1: New User với Google Avatar
**Input**: User chưa tồn tại trong hệ thống, Google profile có avatar
**Expected**: 
- Tạo user mới với avatar từ Google
- Status: ACTIVE
- GoogleId được set

### Scenario 2: Existing User không có Avatar
**Input**: User đã tồn tại nhưng chưa có avatar, Google profile có avatar
**Expected**:
- Cập nhật avatar từ Google
- Cập nhật GoogleId
- Giữ nguyên các thông tin khác

### Scenario 3: Existing User đã có Avatar
**Input**: User đã tồn tại và đã có avatar, Google profile có avatar
**Expected**:
- Chỉ cập nhật GoogleId
- Giữ nguyên avatar hiện tại
- Không ghi đè avatar

### Scenario 4: Google Profile không có Avatar
**Input**: User mới hoặc existing, Google profile không có avatar
**Expected**:
- Avatar được set là null
- GoogleId được set
- Không có lỗi

## 🔧 Code Logic

### GoogleStrategy Logic:
```typescript
// Tìm user theo email
let existingUser = await this.userService.findByEmail(googleUserInfo.email);

if (existingUser) {
  // Cập nhật nếu:
  // 1. Chưa có GoogleId HOẶC
  // 2. Chưa có avatar và Google có avatar
  if (!existingUser.googleId || (!existingUser.avatar && googleUserInfo.avatar)) {
    existingUser = await this.userService.updateGoogleUserInfo(
      existingUser._id.toString(), 
      googleUserInfo.googleId,
      googleUserInfo.avatar
    );
  }
} else {
  // Tạo user mới với avatar từ Google
  const newUser = await this.userService.createFromGoogle(googleUserInfo);
}
```

### UserService Logic:
```typescript
// updateGoogleUserInfo: Luôn cập nhật GoogleId, chỉ cập nhật avatar nếu Google có
async updateGoogleUserInfo(userId: string, googleId: string, avatar?: string) {
  const updateData: any = { googleId };
  if (avatar) {
    updateData.avatar = avatar;
  }
  // Update user...
}

// createFromGoogle: Tạo user mới với avatar từ Google
async createFromGoogle(googleUser: any) {
  return new User({
    googleId: googleUser.googleId,
    email: googleUser.email,
    fullName: googleUser.fullName,
    avatar: googleUser.avatar || null, // Set avatar từ Google
    status: Status.ACTIVE,
    role: Role.STUDENT,
  });
}
```

## 🧪 Test URLs

### Test với Avatar:
```
http://localhost:3000/auth/google/callback/test?access_token=eyJ...&refresh_token=abc123&user_info={"email":"test@gmail.com","fullName":"Test User","role":"STUDENT","avatar":"https://lh3.googleusercontent.com/a/avatar.jpg"}
```

### Test không có Avatar:
```
http://localhost:3000/auth/google/callback/test?access_token=eyJ...&refresh_token=abc123&user_info={"email":"test@gmail.com","fullName":"Test User","role":"STUDENT","avatar":null}
```

## 📋 Checklist

- ✅ GoogleStrategy xử lý avatar từ Google profile
- ✅ UserService.updateGoogleUserInfo cập nhật avatar cho existing users
- ✅ UserService.createFromGoogle set avatar cho new users
- ✅ Logic chỉ cập nhật avatar nếu user chưa có và Google có
- ✅ Frontend hiển thị avatar trong user info
- ✅ Error handling cho trường hợp không có avatar

## 🎉 Expected Results

1. **New users**: Avatar được set từ Google profile
2. **Existing users without avatar**: Avatar được cập nhật từ Google
3. **Existing users with avatar**: Avatar hiện tại được giữ nguyên
4. **No Google avatar**: Avatar được set là null, không có lỗi
5. **Frontend**: Hiển thị avatar trong localStorage user_info
