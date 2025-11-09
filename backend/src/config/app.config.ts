import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  CustomLogger,
  LoggingInterceptor,
  ValidationExceptionFilter,
} from '../shared';
import { loadDocs } from 'src/docs';

export const createLogger = () => new CustomLogger('Bootstrap');

export const getAppPort = (): number => {
  const port = process.env.PORT ?? 3000;
  return typeof port === 'string' ? parseInt(port, 10) : port;
};

export const applyAppConfig = (
  app: INestApplication<any>,
  logger: CustomLogger,
) => {
  app.useLogger(logger);
  app.enableCors();
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        }));
        return new BadRequestException(result);
      },
    }),
  );
  loadDocs(app);
};
