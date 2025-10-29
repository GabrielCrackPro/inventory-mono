import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

type ApiDocsOptions = {
  tags?: string[];
  summary?: string;
  bearer?: boolean;
  responses?: Array<{ status: number; description?: string; type?: Type<any> }>;
  bodyType?: Type<any> | undefined;
};

/**
 * Composed decorator for commonly used swagger decorators.
 * @example  @ApiDocs({ tags: ['auth'], summary: 'Login', bearer: false, responses: [...] })
 */
export function ApiDocs(options: ApiDocsOptions) {
  const decorators = [] as Array<MethodDecorator | ClassDecorator>;

  if (options.tags && options.tags.length > 0) {
    decorators.push(ApiTags(...options.tags));
  }

  if (options.bearer) {
    decorators.push(ApiBearerAuth());
  }

  if (options.summary) {
    decorators.push(ApiOperation({ summary: options.summary }));
  }

  if (options.bodyType) {
    decorators.push(ApiBody({ type: options.bodyType as any }));
  }

  if (options.responses && options.responses.length > 0) {
    for (const r of options.responses) {
      decorators.push(
        ApiResponse({
          status: r.status,
          description: r.description,
          type: r.type as any,
        }),
      );
    }
  }

  return applyDecorators(...(decorators as any));
}
