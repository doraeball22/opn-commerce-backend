import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ValidationErrorResponse {
  message: string;
  errors: Array<{
    field: string;
    message: string;
    value: any;
  }>;
  statusCode: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        exception instanceof BadRequestException &&
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as ValidationErrorResponse).errors
      ) {
        // Handle validation errors with detailed field-level errors
        const validationResponse = exceptionResponse as ValidationErrorResponse;
        responseBody = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: validationResponse.message || 'Validation failed',
          errors: validationResponse.errors,
        };
      } else if (typeof exceptionResponse === 'string') {
        responseBody.message = exceptionResponse;
        responseBody.statusCode = status;
      } else if (typeof exceptionResponse === 'object') {
        responseBody = {
          ...responseBody,
          statusCode: status,
          message: (exceptionResponse as any).message || 'Bad request',
          ...(Array.isArray((exceptionResponse as any).message) && {
            errors: (exceptionResponse as any).message.map((msg: string) => ({
              message: msg,
            })),
          }),
        };
      }
    } else if (exception instanceof Error) {
      // Handle domain errors
      if (exception.message.includes('already exists')) {
        status = HttpStatus.CONFLICT;
      } else if (exception.message.includes('not found')) {
        status = HttpStatus.NOT_FOUND;
      } else if (
        exception.message.includes('Invalid') ||
        exception.message.includes('incorrect')
      ) {
        status = HttpStatus.BAD_REQUEST;
      } else if (
        exception.message.includes('Unauthorized') ||
        exception.message.includes('token')
      ) {
        status = HttpStatus.UNAUTHORIZED;
      }

      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      };
    }

    // Log the error for debugging (in production, use proper logging)
    if (status >= 500) {
      console.error('Internal Server Error:', exception);
    }

    response.status(status).json(responseBody);
  }
}
