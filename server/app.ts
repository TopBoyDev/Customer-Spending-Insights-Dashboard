import compression from 'compression';
import express, { type Express } from 'express';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { createErrorHandler, apiNotFound } from './http-errors';
import { createClientErrorRouter, type ClientErrorOptions } from './routes/client-error-routes';
import { createCustomerRouter } from './routes/customer-routes';
import type { InsightsService } from './services/insights-service';

export interface AppOptions {
  service: InsightsService;
  /** Directory with the built React app. When absent, only the API is served. */
  staticDir?: string | undefined;
  /** Artificial latency for manually checking loading states (development only). */
  latencyMs?: number;
  logRequests?: boolean;
  /** Configuration for browser error reports received at POST /api/client-errors. */
  clientErrors?: ClientErrorOptions;
}

export function createApp({
  service,
  staticDir,
  latencyMs = 0,
  logRequests = false,
  clientErrors,
}: AppOptions): Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', false);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // MUI/Emotion inject <style> elements at runtime.
          'style-src': ["'self'", "'unsafe-inline'"],
          // Do not force HTTPS for a container that is commonly run on plain HTTP locally.
          'upgrade-insecure-requests': null,
        },
      },
    }),
  );
  app.use(compression());

  if (logRequests) {
    app.use((req, res, next) => {
      const started = process.hrtime.bigint();
      res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
        console.info(
          JSON.stringify({
            method: req.method,
            path: req.originalUrl.split('?')[0],
            status: res.statusCode,
            durationMs: Math.round(durationMs),
          }),
        );
      });
      next();
    });
  }

  const api = express.Router();
  api.use((_req, res, next) => {
    // Personal financial data must never be stored by shared caches.
    res.set('Cache-Control', 'no-store');
    next();
  });
  if (latencyMs > 0) {
    api.use((_req, _res, next) => {
      setTimeout(next, latencyMs);
    });
  }
  api.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  api.get('/meta', (_req, res) => {
    res.json(service.getMeta());
  });
  api.use('/customers', createCustomerRouter(service));
  api.use('/client-errors', createClientErrorRouter(clientErrors));
  api.use(apiNotFound);

  // The /api prefix is reserved before any static file or SPA fallback.
  app.use('/api', api);

  if (staticDir && fs.existsSync(path.join(staticDir, 'index.html'))) {
    app.use(
      '/assets',
      express.static(path.join(staticDir, 'assets'), {
        immutable: true,
        maxAge: '1y',
        index: false,
      }),
    );
    app.use(express.static(staticDir, { index: false, maxAge: 0 }));
    app.get('*', (_req, res) => {
      res.set('Cache-Control', 'no-cache');
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  app.use(createErrorHandler((message, error) => console.error(message, error)));
  return app;
}
