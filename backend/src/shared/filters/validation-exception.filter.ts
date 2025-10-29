import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Handle validation errors from our custom exception factory
    if (Array.isArray(exceptionResponse)) {
      const formattedErrors = exceptionResponse.map((error) => {
        const constraintMessages = error.constraints
          ? Object.values(error.constraints)
          : ['Invalid value'];

        return {
          field: error.property,
          value: error.value,
          errors: constraintMessages,
        };
      });

      return response.status(status).json({
        statusCode: status,
        error: 'Validation Error',
        message: 'Validation failed',
        errors: formattedErrors,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle standard validation errors
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const { message } = exceptionResponse as any;

      // If it's an array of validation errors, format them nicely
      if (Array.isArray(message)) {
        return response.status(status).json({
          statusCode: status,
          error: 'Validation Error',
          message: 'Validation failed',
          errors: message.map((msg) => ({ field: 'unknown', errors: [msg] })),
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Default error response
    response.status(status).json({
      statusCode: status,
      error: 'Bad Request',
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
