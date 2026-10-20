import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../server/app';
import { createDemoService } from '../../server/create-demo-service';
import type { ClientErrorReport } from '../../server/routes/client-error-routes';

const service = createDemoService('2026-10-19');

const report = {
  kind: 'render',
  message: 'Cannot read properties of undefined',
  stack: 'TypeError: Cannot read properties of undefined\n    at Summary',
  componentStack: '\n    at SummaryCard',
  url: 'http://localhost:3000/?view=overview',
  timestamp: '2026-10-19T10:00:00.000Z',
};

function appWithSink(options: { limit?: number; now?: () => number } = {}) {
  const sink = vi.fn<(report: ClientErrorReport) => void>();
  const app = createApp({ service, clientErrors: { sink, ...options } });
  return { app, sink };
}

describe('POST /api/client-errors', () => {
  it('accepts a valid report and forwards it to the sink', async () => {
    const { app, sink } = appWithSink();
    const res = await request(app).post('/api/client-errors').send(report).expect(202);
    expect(res.text).toBe('');
    expect(sink).toHaveBeenCalledWith(report);
  });

  it('rejects reports that do not match the schema', async () => {
    const { app, sink } = appWithSink();
    const res = await request(app)
      .post('/api/client-errors')
      .send({ ...report, kind: 'other', message: '' })
      .expect(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.details.map((d: { field: string }) => d.field).sort()).toEqual([
      'kind',
      'message',
    ]);
    expect(sink).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON and oversized bodies', async () => {
    const { app } = appWithSink();
    await request(app)
      .post('/api/client-errors')
      .set('Content-Type', 'application/json')
      .send('{"kind":')
      .expect(400);
    const res = await request(app)
      .post('/api/client-errors')
      .send({ ...report, stack: 'x'.repeat(20_000) })
      .expect(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('rate-limits each client address per window', async () => {
    let time = 0;
    const { app, sink } = appWithSink({ limit: 2, now: () => time });
    await request(app).post('/api/client-errors').send(report).expect(202);
    await request(app).post('/api/client-errors').send(report).expect(202);
    const limited = await request(app).post('/api/client-errors').send(report).expect(429);
    expect(limited.body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(sink).toHaveBeenCalledTimes(2);

    time = 60_000;
    await request(app).post('/api/client-errors').send(report).expect(202);
  });

  it('only accepts POST', async () => {
    const { app } = appWithSink();
    await request(app).get('/api/client-errors').expect(404);
  });
});
