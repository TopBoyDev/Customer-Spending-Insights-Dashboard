import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '../shared/types';

export class HttpError extends Error {
  constructor(
    readonly status: 400 | 404,
    readonly code: ApiErrorBody['error']['code'],
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const apiNotFound: RequestHandler = (_req, res) => {
  const body: ApiErrorBody = { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } };
  res.status(404).json(body);
};

/** Converts any error into the documented JSON error shape. Never leaks stack traces. */
export function createErrorHandler(log: (message: string, error: unknown) => void) {
  const handler: ErrorRequestHandler = (error, _req, res, _next) => {
    let status = 500;
    let body: ApiErrorBody;

    if (error instanceof ZodError) {
      status = 400;
      body = {
        error: {
          code: 'BAD_REQUEST',
          message: 'One or more query parameters are invalid',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.') || 'query',
            message: issue.message,
          })),
        },
      };
    } else if (error instanceof HttpError) {
      status = error.status;
      body = { error: { code: error.code, message: error.message } };
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      error.type === 'entity.parse.failed'
    ) {
      status = 400;
      body = { error: { code: 'BAD_REQUEST', message: 'Malformed request' } };
    } else {
      log('Unhandled error', error);
      body = {
        error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
      };
    }

    res.status(status).json(body);
  };
  return handler;
}
