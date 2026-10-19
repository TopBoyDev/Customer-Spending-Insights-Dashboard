import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../server/app';
import { createDemoService } from '../../server/create-demo-service';

const service = createDemoService('2026-10-19');
const app = createApp({ service });
const base = '/api/customers/12345';

describe('documented endpoints', () => {
  it('GET /profile', async () => {
    const res = await request(app).get(`${base}/profile`).expect(200);
    expect(res.body).toEqual({
      customerId: '12345',
      name: expect.any(String),
      email: expect.stringMatching(/@example\.com$/),
      joinDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      accountType: 'premium',
      totalSpent: expect.any(Number),
      currency: 'ZAR',
    });
  });

  it('GET /spending/summary defaults to 30d', async () => {
    const res = await request(app).get(`${base}/spending/summary`).expect(200);
    expect(res.body).toEqual({
      period: '30d',
      totalSpent: expect.any(Number),
      transactionCount: expect.any(Number),
      averageTransaction: expect.any(Number),
      topCategory: expect.any(String),
      comparedToPrevious: {
        spentChange: expect.any(Number),
        transactionChange: expect.any(Number),
      },
    });
  });

  it('GET /spending/categories accepts a custom date range', async () => {
    const res = await request(app)
      .get(`${base}/spending/categories`)
      .query({ startDate: '2026-10-01', endDate: '2026-10-19' })
      .expect(200);
    expect(res.body.dateRange).toEqual({ startDate: '2026-10-01', endDate: '2026-10-19' });
    expect(res.body.categories[0]).toEqual({
      name: expect.any(String),
      amount: expect.any(Number),
      percentage: expect.any(Number),
      transactionCount: expect.any(Number),
      color: expect.stringMatching(/^#[0-9A-F]{6}$/),
      icon: expect.any(String),
    });
  });

  it('GET /spending/trends returns the requested number of months', async () => {
    const res = await request(app).get(`${base}/spending/trends?months=6`).expect(200);
    expect(res.body.trends).toHaveLength(6);
    expect(res.body.trends[5].month).toBe('2026-10');
    const defaults = await request(app).get(`${base}/spending/trends`).expect(200);
    expect(defaults.body.trends).toHaveLength(12);
  });

  it('GET /transactions filters, sorts and paginates', async () => {
    const res = await request(app)
      .get(`${base}/transactions`)
      .query({
        limit: 5,
        offset: 5,
        category: 'Groceries',
        sortBy: 'amount_desc',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
      })
      .expect(200);
    const { transactions, pagination } = res.body as {
      transactions: { category: string; amount: number; date: string }[];
      pagination: { total: number; limit: number; offset: number; hasMore: boolean };
    };
    expect(pagination).toMatchObject({ limit: 5, offset: 5, hasMore: true });
    expect(transactions).toHaveLength(5);
    expect(transactions.every((t) => t.category === 'Groceries')).toBe(true);
    const amounts = transactions.map((t) => t.amount);
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
  });

  it('GET /transactions defaults to 20 newest first', async () => {
    const res = await request(app).get(`${base}/transactions`).expect(200);
    expect(res.body.transactions).toHaveLength(20);
    expect(res.body.pagination).toMatchObject({ limit: 20, offset: 0, hasMore: true });
    const dates = (res.body.transactions as { date: string }[]).map((t) => t.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('GET /goals and /filters', async () => {
    const goals = await request(app).get(`${base}/goals`).expect(200);
    expect(goals.body.goals.length).toBeGreaterThan(0);
    const filters = await request(app).get(`${base}/filters`).expect(200);
    expect(filters.body.categories).toHaveLength(6);
    expect(filters.body.dateRangePresets.map((p: { value: string }) => p.value)).toEqual([
      '7d',
      '30d',
      '90d',
      '1y',
    ]);
  });

  it('returns identical data on repeated requests', async () => {
    const first = await request(app).get(`${base}/spending/summary?period=90d`);
    const second = await request(app).get(`${base}/spending/summary?period=90d`);
    expect(second.body).toEqual(first.body);
  });
});

describe('validation and errors', () => {
  it.each([
    [`${base}/spending/summary?period=2w`, 'period'],
    [`${base}/spending/categories?startDate=2026-10-01`, 'endDate'],
    [`${base}/spending/categories?startDate=2026-10-10&endDate=2026-10-01`, 'startDate'],
    [`${base}/spending/categories?startDate=2026-02-30&endDate=2026-03-01`, 'startDate'],
    [`${base}/spending/trends?months=25`, 'months'],
    [`${base}/spending/trends?months=abc`, 'months'],
    [`${base}/transactions?limit=0`, 'limit'],
    [`${base}/transactions?limit=101`, 'limit'],
    [`${base}/transactions?offset=-1`, 'offset'],
    [`${base}/transactions?sortBy=name`, 'sortBy'],
    [`${base}/transactions?category=Gambling`, 'category'],
    [`${base}/transactions?period=7d&startDate=2026-10-01`, 'period'],
  ])('400 for %s', async (url, field) => {
    const res = await request(app).get(url).expect(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
  });

  it('404 for an unknown customer and unknown endpoint', async () => {
    const customer = await request(app).get('/api/customers/99999/profile').expect(404);
    expect(customer.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    await request(app).get('/api/unknown').expect(404);
  });

  it('400 for a malformed customer id', async () => {
    await request(app).get('/api/customers/bad%20id/profile').expect(400);
  });

  it('never leaks internal error details', async () => {
    const failing = createApp({
      service: {
        ...service,
        getGoals: () => {
          throw new Error('secret stack detail');
        },
      },
    });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(failing).get(`${base}/goals`).expect(500);
    expect(JSON.stringify(res.body)).not.toContain('secret');
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(log).toHaveBeenCalled();
  });
});

describe('HTTP hygiene', () => {
  it('marks financial data as non-cacheable and sets security headers', async () => {
    const res = await request(app).get(`${base}/profile`).expect(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('exposes health and meta endpoints', async () => {
    await request(app).get('/api/health').expect(200, { status: 'ok' });
    await request(app)
      .get('/api/meta')
      .expect(200, { dataAsOf: '2026-10-19', timezone: 'Africa/Johannesburg', currency: 'ZAR' });
  });
});
