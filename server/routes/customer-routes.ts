import { Router } from 'express';
import { HttpError } from '../http-errors';
import type { InsightsService } from '../services/insights-service';
import {
  categoriesQuerySchema,
  customerIdSchema,
  summaryQuerySchema,
  transactionsQuerySchema,
  trendsQuerySchema,
} from '../validation';

/**
 * Thin handlers: validate input, call the service, return typed JSON.
 * Express 4 does not forward async errors, but every handler here is
 * synchronous, so thrown errors reach the error middleware.
 */
export function createCustomerRouter(service: InsightsService): Router {
  const router = Router();

  router.param('customerId', (_req, _res, next, value: string) => {
    const parsed = customerIdSchema.safeParse(value);
    if (!parsed.success) {
      next(new HttpError(400, 'BAD_REQUEST', 'Invalid customer ID'));
      return;
    }
    if (!service.hasCustomer(parsed.data)) {
      next(new HttpError(404, 'NOT_FOUND', 'Customer not found'));
      return;
    }
    next();
  });

  router.get('/:customerId/profile', (_req, res) => {
    res.json(service.getProfile());
  });

  router.get('/:customerId/spending/summary', (req, res) => {
    const { period } = summaryQuerySchema.parse(req.query);
    res.json(service.getSummary(period));
  });

  router.get('/:customerId/spending/categories', (req, res) => {
    const { period, startDate, endDate } = categoriesQuerySchema.parse(req.query);
    res.json(
      startDate && endDate
        ? service.getCategories({ startDate, endDate })
        : service.getCategoriesForPeriod(period),
    );
  });

  router.get('/:customerId/spending/trends', (req, res) => {
    const { months } = trendsQuerySchema.parse(req.query);
    res.json(service.getTrends(months));
  });

  router.get('/:customerId/transactions', (req, res) => {
    const { period, ...query } = transactionsQuerySchema.parse(req.query);
    const range = period ? service.resolvePeriod(period) : query;
    res.json(
      service.getTransactions({
        ...query,
        startDate: range.startDate,
        endDate: range.endDate,
      }),
    );
  });

  router.get('/:customerId/goals', (_req, res) => {
    res.json(service.getGoals());
  });

  router.get('/:customerId/filters', (_req, res) => {
    res.json(service.getFilters());
  });

  return router;
}
