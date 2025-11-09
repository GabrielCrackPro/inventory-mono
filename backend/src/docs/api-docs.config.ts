import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { meta } from './api-docs-meta';

const createDocs = (app: INestApplication<any>) => {
  const docsConfig = new DocumentBuilder()
    .setTitle(meta.title)
    .setDescription(meta.description)
    .setVersion(meta.version)
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, docsConfig);
};

export const loadDocs = (app: INestApplication<any>) => {
  app
    .getHttpAdapter()
    .getInstance()
    .get('/api', (_req: any, res: any) => {
      res.redirect('/api/docs');
    });

  return app.use(
    '/api/docs',
    apiReference({
      content: createDocs(app),
      darkMode: true,
      hideDarkModeToggle: true,
      defaultOpenAllTags: true,
      layout: 'modern',
      theme: 'elysiajs',
    }),
  );
};
