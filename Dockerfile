# Sử dụng node:18-alpine (nhẹ hơn)
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép file package.json và yarn.lock trước để tối ưu layer cache
COPY package.json yarn.lock ./

# Cài đặt dependencies (chỉ cài production nếu không cần devDependencies)
RUN yarn install --frozen-lockfile --production

# Sao chép toàn bộ source code vào container
COPY . .

# Build ứng dụng
RUN yarn build

# Mở port 8000
EXPOSE 8000

# Chạy ứng dụng ở chế độ production
CMD ["yarn", "start:prod"]
