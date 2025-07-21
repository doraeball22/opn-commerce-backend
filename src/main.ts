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
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(appConfig.apiDocs.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Bind to all interfaces (0.0.0.0) for Docker containers, localhost for development
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  await app.listen(appConfig.port, host);
  console.log(`🚀 Application is running on: http://${host}:${appConfig.port}`);

  if (appConfig.apiDocs.enabled) {
    console.log(
      `📚 Swagger documentation: http://localhost:${appConfig.port}/${appConfig.apiDocs.path}`,
    );
  }

  console.log(`🔗 API endpoints: http://localhost:${appConfig.port}/v1`);

  console.log(`🌍 Environment: ${appConfig.nodeEnv}`);
}
bootstrap();
