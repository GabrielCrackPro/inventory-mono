import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor({
    message,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    userId,
    requestId,
    timestamp,
  }: {
    message: string;
    statusCode?: number;
    userId?: number;
    requestId?: string;
    timestamp?: Date;
  }) {
    super(message, statusCode);

    this.userId = userId;
    this.requestId = requestId;
    this.timestamp = timestamp;
  }

  public userId?: number;
  public requestId?: string;
  public timestamp?: Date;
}

export class NotFoundException extends CustomHttpException {
  constructor(
    message: string,
    options?: { userId?: number; requestId?: string },
  ) {
    super({
      message,
      statusCode: HttpStatus.NOT_FOUND,
      ...options,
      timestamp: new Date(),
    });
  }
}

export class BadRequestException extends CustomHttpException {
  constructor(
    message: string,
    options?: { userId?: number; requestId?: string },
  ) {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      ...options,
      timestamp: new Date(),
    });
  }
}

export class UnauthorizedException extends CustomHttpException {
  constructor(
    message: string,
    options?: { userId?: number; requestId?: string },
  ) {
    super({
      message,
      statusCode: HttpStatus.UNAUTHORIZED,
      ...options,
      timestamp: new Date(),
    });
  }
}

export class ForbiddenException extends CustomHttpException {
  constructor(
    message: string,
    options?: { userId?: number; requestId?: string },
  ) {
    super({
      message,
      statusCode: HttpStatus.FORBIDDEN,
      ...options,
      timestamp: new Date(),
    });
  }
}

export class InternalServerErrorException extends CustomHttpException {
  constructor(
    message: string,
    options?: { userId?: number; requestId?: string },
  ) {
    super({
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      ...options,
      timestamp: new Date(),
    });
  }
}
