import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  CustomLogger,
  LoggingInterceptor,
  ValidationExceptionFilter,
  CustomCacheInterceptor,
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
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:5173',
      'http://127.0.0.1:4200',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204,
  });
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(app.get(CustomCacheInterceptor));
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
