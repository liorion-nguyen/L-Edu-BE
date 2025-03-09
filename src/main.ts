import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const basicAuth = require("express-basic-auth");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  app.enableCors();

  app.use(
    "/api",
    basicAuth({
      users: { admin: "l-edu" },
      challenge: true,
    })
  )
  
  const congif = new DocumentBuilder()
    .setTitle('API L-Edu')
    .setDescription('The API documentation for L-Edu')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: "JWT"
      },
      "access_token"
    )
    .build();

  const document = SwaggerModule.createDocument(app, congif);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
