import { createApp } from './app';
import { loadConfig } from './config';
import { createDemoService } from './create-demo-service';

// The production bundle has NODE_ENV compiled in as "production" (see tsup.config.ts),
// so `npm start` serves the dashboard without the caller having to set it.
const config = loadConfig({ ...process.env, NODE_ENV: process.env.NODE_ENV });
const app = createApp({
  service: createDemoService(config.referenceDate),
  staticDir: config.isProduction ? config.staticDir : undefined,
  latencyMs: config.latencyMs,
  logRequests: config.isProduction,
});

const server = app.listen(config.port, config.host, () => {
  console.info(
    `Spending Insights ${config.isProduction ? 'server' : 'mock API'} listening on http://localhost:${config.port} (demo data through ${config.referenceDate})`,
  );
});

function shutdown(signal: string) {
  console.info(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  // Force exit if open connections keep the server alive.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
