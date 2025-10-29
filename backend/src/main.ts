import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadDocs } from './docs';
import {
  CustomLogger,
  LoggingInterceptor,
  ValidationExceptionFilter,
} from './shared';

async function bootstrap() {
  const logger = new CustomLogger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  const port = process.env.PORT ?? 3000;

  loadDocs(app);

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

  await app.listen(port, () => {
    logger.success(`🚀 App running on port ${port}...`);
  });
}

bootstrap();
