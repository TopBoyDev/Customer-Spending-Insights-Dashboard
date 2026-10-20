import express, { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { HttpError } from '../http-errors';

/** Shape of a report sent by the browser (see src/services/error-reporter.ts). */
export const clientErrorSchema = z.object({
  kind: z.enum(['render', 'uncaught', 'unhandledrejection']),
  message: z.string().min(1).max(1_000),
  stack: z.string().max(8_000).optional(),
  componentStack: z.string().max(8_000).optional(),
  url: z.string().max(2_000).optional(),
  userAgent: z.string().max(500).optional(),
  timestamp: z.string().datetime(),
});

export type ClientErrorReport = z.infer<typeof clientErrorSchema>;

export interface ClientErrorOptions {
  /** Where reports go. Defaults to one structured JSON line on stderr. */
  sink?: (report: ClientErrorReport) => void;
  /** Maximum reports per client address per window. */
  limit?: number;
  windowMs?: number;
  now?: () => number;
}

const defaultSink = (report: ClientErrorReport) => {
  console.error(JSON.stringify({ level: 'error', source: 'client', ...report }));
};

/**
 * Fixed-window, in-memory limiter keyed by client address. Enough to stop one
 * misbehaving browser flooding the logs; a multi-instance deployment would use
 * a shared store or rate-limit at the edge instead.
 */
function rateLimit(limit: number, windowMs: number, now: () => number): RequestHandler {
  const windows = new Map<string, { start: number; count: number }>();
  return (req, _res, next) => {
    const key = req.ip ?? 'unknown';
    const time = now();
    const current = windows.get(key);
    if (!current || time - current.start >= windowMs) {
      // Opportunistic clean-up keeps the map bounded.
      if (windows.size > 10_000) windows.clear();
      windows.set(key, { start: time, count: 1 });
      next();
      return;
    }
    current.count += 1;
    if (current.count > limit) {
      next(new HttpError(429, 'TOO_MANY_REQUESTS', 'Too many error reports'));
      return;
    }
    next();
  };
}

/**
 * Receives browser error reports. Accepts only small JSON bodies, validates
 * them, and responds 202 without echoing anything back.
 */
export function createClientErrorRouter({
  sink = defaultSink,
  limit = 30,
  windowMs = 60_000,
  now = Date.now,
}: ClientErrorOptions = {}): Router {
  const router = Router();
  router.post('/', rateLimit(limit, windowMs, now), express.json({ limit: '16kb' }), (req, res) => {
    sink(clientErrorSchema.parse(req.body));
    res.status(202).end();
  });
  return router;
}
