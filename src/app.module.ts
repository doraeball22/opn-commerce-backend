import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AllExceptionsFilter } from './shared/exceptions/all-exceptions.filter';
import { appConfig, databaseConfig, configValidationSchema } from './config';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // Strip properties that don't have decorators
        forbidNonWhitelisted: true, // Throw error if unknown properties are present
        transform: true, // Automatically transform payloads to DTO instances
        disableErrorMessages: false, // Enable detailed error messages
        validationError: {
          target: false, // Don't expose target object in error
          value: false, // Don't expose value in error
        },
        transformOptions: {
          enableImplicitConversion: true, // Enable automatic type conversion
        },
        stopAtFirstError: false, // Validate all properties, not just first error
        skipMissingProperties: false, // Don't skip properties that are undefined
        skipNullProperties: false, // Don't skip properties that are null
        skipUndefinedProperties: false, // Don't skip properties that are undefined
        exceptionFactory: (errors) => {
          // Custom error formatting for better API responses
          const formattedErrors = errors.map((error) => ({
            field: error.property,
            message:
              Object.values(error.constraints || {})[0] || 'Invalid value',
            value: error.value,
          }));
          return new BadRequestException({
            message: 'Validation failed',
            errors: formattedErrors,
            statusCode: 400,
          });
        },
      }),
    },
  ],
})
export class AppModule {}
