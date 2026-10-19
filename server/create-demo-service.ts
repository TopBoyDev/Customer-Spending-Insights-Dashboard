import { DEFAULT_REFERENCE_DATE, DEMO_CUSTOMER, DEMO_SEED } from './data/demo-customer';
import { generateLedger } from './data/demo-ledger';
import { createInsightsService } from './services/insights-service';

/** Builds the insights service over the deterministic demo ledger. */
export function createDemoService(referenceDate: string = DEFAULT_REFERENCE_DATE) {
  const ledger = generateLedger({
    seed: DEMO_SEED,
    startDate: DEMO_CUSTOMER.ledgerStartDate,
    endDate: referenceDate,
  });
  return createInsightsService({ customer: DEMO_CUSTOMER, ledger, referenceDate });
}
