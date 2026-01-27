import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  TransformInterceptor,
  LoggingInterceptor,
} from './common/interceptors';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads directory exists
  const uploadsPath = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadsPath}`);
  }

  // Serve static files from uploads directory
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });
  console.log(`📂 Serving static files from: ${uploadsPath} at /uploads`);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const priority = [
          'isNotEmpty'
        ];

        return new BadRequestException(
          errors.map(err => {
            let message: any = '';

            if (err.constraints) {
              const key = priority.find(p => err.constraints[p]);
              message =
                err.constraints[key] ??
                Object.values(err.constraints)[0];
            }

            return {
              field: err.property,
              message,
            };
          }),
        );
      },
    }),
  );


  // Apply global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Perkx API')
    .setDescription(
      'API documentation for Perkx with dual authentication system',
    )
    .setVersion('1.0')
    .addTag('User Auth', 'User authentication endpoints')
    .addTag('User Profile', 'User profile management')
    .addTag('Admin Auth', 'Admin authentication endpoints')
    .addTag('Admin Users', 'Admin user management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'user-jwt', // Identifier for user JWT
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Admin JWT token',
        in: 'header',
      },
      'admin-jwt', // Identifier for admin JWT
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Only enable Swagger in development
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, document);
    console.log(
      `📚 API Documentation: http://localhost:${process.env.PORT ?? 3000}/docs`,
    );
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
