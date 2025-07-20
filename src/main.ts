import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { AppConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app')!;

  // Enable CORS if configured
  if (appConfig.corsEnabled) {
    app.enableCors({
      origin: appConfig.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
  }

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix for all routes
  app.setGlobalPrefix(appConfig.apiPrefix);

  // Swagger configuration (only if enabled)
  if (appConfig.apiDocs.enabled) {
    const config = new DocumentBuilder()
      .setTitle('OPN Commerce Backend')
      .setDescription(
        'RESTful API for user management - Opn.Pro Engineering Challenge',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter mock JWT token (e.g., faketoken_user1)',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Users', 'User management endpoints')
      .addTag('Address', 'User address management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(appConfig.apiDocs.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(appConfig.port);
  console.log(`🚀 Application is running on: http://localhost:${appConfig.port}`);
  
  if (appConfig.apiDocs.enabled) {
    console.log(`📚 Swagger documentation: http://localhost:${appConfig.port}/${appConfig.apiDocs.path}`);
  }
  
  console.log(`🔗 API ${appConfig.apiPrefix} endpoints: http://localhost:${appConfig.port}/${appConfig.apiPrefix}/`);
  console.log(`🌍 Environment: ${appConfig.nodeEnv}`);
}
bootstrap();
