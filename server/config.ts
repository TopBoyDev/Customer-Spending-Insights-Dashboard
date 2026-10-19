import path from 'node:path';
import { isValidIsoDate } from '../shared/dates';
import { DEFAULT_REFERENCE_DATE } from './data/demo-customer';

export interface ServerConfig {
  host: string;
  port: number;
  isProduction: boolean;
  referenceDate: string;
  staticDir: string;
  latencyMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const isProduction = env.NODE_ENV === 'production';
  const port = Number(env.PORT ?? (isProduction ? 3000 : 3001));
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error(`Invalid PORT: ${env.PORT}`);
  }

  const referenceDate = env.DEMO_REFERENCE_DATE ?? DEFAULT_REFERENCE_DATE;
  if (!isValidIsoDate(referenceDate)) {
    throw new Error(`Invalid DEMO_REFERENCE_DATE (expected YYYY-MM-DD): ${referenceDate}`);
  }

  const latencyMs = isProduction ? 0 : Number(env.API_LATENCY_MS ?? 0);

  return {
    host: env.HOST ?? '0.0.0.0',
    port,
    isProduction,
    referenceDate,
    staticDir: path.resolve(env.STATIC_DIR ?? path.join(process.cwd(), 'dist')),
    latencyMs: Number.isFinite(latencyMs) ? latencyMs : 0,
  };
}
