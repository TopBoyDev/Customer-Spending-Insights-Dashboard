import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '../shared/types';

export class HttpError extends Error {
  constructor(
    readonly status: 400 | 404 | 429,
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

/** The `type` that body-parser attaches to its errors, if any. */
function bodyParserError(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'type' in error
    ? String(error.type)
    : undefined;
}

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
          message: 'One or more request parameters are invalid',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.') || 'request',
            message: issue.message,
          })),
        },
      };
    } else if (error instanceof HttpError) {
      status = error.status;
      body = { error: { code: error.code, message: error.message } };
    } else if (bodyParserError(error) === 'entity.parse.failed') {
      status = 400;
      body = { error: { code: 'BAD_REQUEST', message: 'Malformed request' } };
    } else if (bodyParserError(error) === 'entity.too.large') {
      status = 413;
      body = { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' } };
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
