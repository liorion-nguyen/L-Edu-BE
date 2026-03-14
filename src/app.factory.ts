import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'https://l-edu.vercel.app',
    'http://localhost:3000',
    'https://l-edu-fe.vercel.app',
    'https://l-edu-admin.vercel.app',
    'http://localhost:3001',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^https:\/\/l-edu-admin(-[\w-]+)?\.vercel\.app$/.test(origin)) return callback(null, true);
      if (/^https:\/\/l-edu(-[\w-]+)?\.vercel\.app$/.test(origin)) return callback(null, true);
      if (/^https:\/\/l-edu-fe(-[\w-]+)?\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API L-Edu')
    .setDescription('The API documentation for L-Edu')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth')
    .build();

  app.use(
    '/api',
    basicAuth({
      users: { admin: 'l-edu' },
      challenge: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  return app;
}
