# Sử dụng Node 18 với Alpine Linux
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt Yarn và NestJS CLI
RUN apk add --no-cache yarn && yarn global add @nestjs/cli

# Sao chép file package.json và yarn.lock để tối ưu cache
COPY package.json yarn.lock ./

# Cài đặt dependencies (bao gồm cả devDependencies để build)
RUN yarn install --frozen-lockfile

# Sao chép toàn bộ source code
COPY . .

# Build ứng dụng NestJS
RUN yarn build

# Mở port 8000
EXPOSE 8000

# Chạy ứng dụng ở chế độ production
CMD ["yarn", "start:prod"]
