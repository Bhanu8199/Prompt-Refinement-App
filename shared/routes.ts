import { z } from 'zod';
import { insertPromptSchema, prompts, refineInputSchema, refinedOutputSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  prompts: {
    refine: {
      method: 'POST' as const,
      path: '/api/prompts/refine',
      input: refineInputSchema,
      responses: {
        201: z.custom<typeof prompts.$inferSelect>(), // Returns the saved prompt record
        400: errorSchemas.validation,
        500: errorSchemas.internal
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/prompts',
      responses: {
        200: z.array(z.custom<typeof prompts.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/prompts/:id',
      responses: {
        200: z.custom<typeof prompts.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
