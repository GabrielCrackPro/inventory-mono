import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppConfig, createLogger, getAppPort } from './config';

async function bootstrap() {
  const logger = createLogger();

  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  const port = getAppPort();

  applyAppConfig(app, logger);

  await app.listen(port, () => {
    logger.success(`🚀 App running on port ${port}...`);
  });
}

bootstrap();
