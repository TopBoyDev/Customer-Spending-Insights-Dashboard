import type { CategoryName } from '../../shared/categories';
import { addDays, daysInMonth, diffInDays, toLocalDate } from '../../shared/dates';
import type { PaymentMethod } from '../../shared/types';
import { createRandom, type Random } from './random';

/**
 * A single spending transaction as stored by the mock service.
 * Money is kept in integer cents to avoid floating-point drift in totals.
 */
export interface LedgerEntry {
  id: string;
  /** ISO-8601 UTC instant. */
  date: string;
  /** Africa/Johannesburg calendar date of `date` (precomputed for filtering). */
  localDate: string;
  merchant: string;
  category: CategoryName;
  amountCents: number;
  description: string;
  paymentMethod: PaymentMethod;
}

export interface LedgerOptions {
  seed: number;
  /** First calendar day with data (YYYY-MM-DD, inclusive). */
  startDate: string;
  /** Last calendar day with data (YYYY-MM-DD, inclusive). */
  endDate: string;
}

type DraftEntry = Omit<LedgerEntry, 'id' | 'localDate'>;

/** South Africa has observed SAST (UTC+2) without daylight saving since 1944. */
const SAST_OFFSET_HOURS = 2;

function toInstant(localDate: string, hour: number, minute: number): string {
  const [y, m, d] = localDate.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, hour - SAST_OFFSET_HOURS, minute))
    .toISOString()
    .replace('.000Z', 'Z');
}

function cardPayment(random: Random): PaymentMethod {
  return random.chance(0.4) ? 'Credit Card' : 'Debit Card';
}

/** Gentle seasonality: December festive spending, a lean January, cold-winter utilities. */
function seasonalFactor(month: number): number {
  if (month === 12) return 1.3;
  if (month === 1) return 0.85;
  if (month === 11) return 1.1;
  return 1;
}

function generateDay(localDate: string, random: Random): DraftEntry[] {
  const entries: DraftEntry[] = [];
  const [, monthNumber, dayOfMonth] = localDate.split('-').map(Number) as [number, number, number];
  const weekday = new Date(`${localDate}T00:00:00Z`).getUTCDay();
  const isWeekend = weekday === 0 || weekday === 6;
  const season = seasonalFactor(monthNumber);
  const isWinter = monthNumber >= 6 && monthNumber <= 8;
  const monthDays = daysInMonth(localDate.slice(0, 7));

  const add = (
    hour: number,
    category: CategoryName,
    merchant: string,
    amountCents: number,
    description: string,
    paymentMethod: PaymentMethod,
  ) => {
    entries.push({
      date: toInstant(localDate, hour, random.int(0, 59)),
      merchant,
      category,
      amountCents,
      description,
      paymentMethod,
    });
  };

  // Recurring debit orders and subscriptions.
  if (dayOfMonth === 1) add(6, 'Utilities', 'Telkom', 69_900, 'Fibre internet', 'Debit Order');
  if (dayOfMonth === 3)
    add(7, 'Entertainment', 'Showmax', 9_900, 'Streaming subscription', 'Debit Order');
  if (dayOfMonth === 8)
    add(7, 'Entertainment', 'Spotify', 6_999, 'Music subscription', 'Debit Order');
  if (dayOfMonth === 15)
    add(7, 'Entertainment', 'Netflix', 19_900, 'Monthly subscription', 'Debit Order');
  if (dayOfMonth === Math.min(25, monthDays)) {
    add(6, 'Utilities', 'Vodacom', 44_900, 'Mobile contract', 'Debit Order');
  }
  if (dayOfMonth === 5) {
    add(
      6,
      'Utilities',
      'City of Johannesburg',
      random.cents(620, 980),
      'Water and rates',
      'Debit Order',
    );
  }
  if (dayOfMonth === 2 || dayOfMonth === 17) {
    const electricity = isWinter ? random.cents(550, 850) : random.cents(380, 620);
    add(
      random.int(8, 20),
      'Utilities',
      'City Power',
      electricity,
      'Prepaid electricity',
      cardPayment(random),
    );
  }

  // Groceries: a larger weekend shop plus weekday top-ups.
  if (weekday === 6 && random.chance(0.85)) {
    add(
      random.int(9, 13),
      'Groceries',
      random.pick(['Checkers', 'Pick n Pay']),
      Math.round(random.cents(650, 1350) * season),
      'Weekly groceries',
      cardPayment(random),
    );
  }
  if (random.chance(isWeekend ? 0.2 : 0.22)) {
    add(
      random.int(16, 19),
      'Groceries',
      random.pick(['Woolworths Food', 'Spar', 'Shoprite', 'Pick n Pay']),
      random.cents(45, 320),
      'Grocery top-up',
      cardPayment(random),
    );
  }

  // Transportation.
  if (random.chance(0.13)) {
    add(
      random.int(6, 19),
      'Transportation',
      random.pick(['Engen', 'Shell', 'Sasol', 'BP']),
      random.cents(520, 920),
      'Fuel',
      cardPayment(random),
    );
  }
  if (random.chance(isWeekend ? 0.18 : 0.08)) {
    add(
      random.int(8, 22),
      'Transportation',
      'Uber',
      random.cents(65, 260),
      'Ride',
      cardPayment(random),
    );
  }
  if (!isWeekend && random.chance(0.05)) {
    add(7, 'Transportation', 'Gautrain', random.cents(45, 120), 'Train fare', cardPayment(random));
  }

  // Dining.
  if (!isWeekend && random.chance(0.14)) {
    add(
      random.int(12, 13),
      'Dining',
      random.pick(['Kauai', 'Vida e Caffè', 'Mugg & Bean', 'Seattle Coffee Co.']),
      random.cents(65, 175),
      'Lunch',
      cardPayment(random),
    );
  }
  if (isWeekend && random.chance(0.28 * season)) {
    add(
      random.int(18, 20),
      'Dining',
      random.pick(["Nando's", 'Ocean Basket', 'Spur', 'Tashas']),
      random.cents(240, 720),
      'Dinner',
      cardPayment(random),
    );
  }
  if (random.chance(0.05)) {
    // Late-night deliveries sometimes land just after midnight local time, which is
    // still the previous day in UTC: a useful real-world timezone edge case.
    const afterMidnight = random.chance(0.3);
    add(
      afterMidnight ? 0 : random.int(19, 22),
      'Dining',
      'Uber Eats',
      random.cents(140, 320),
      'Food delivery',
      cardPayment(random),
    );
  }

  // Entertainment.
  if (isWeekend && random.chance(0.08)) {
    add(
      random.int(14, 19),
      'Entertainment',
      'Ster-Kinekor',
      random.cents(120, 320),
      'Movie tickets',
      cardPayment(random),
    );
  }
  if (random.chance(0.012)) {
    add(
      random.int(9, 21),
      'Entertainment',
      'Computicket',
      random.cents(350, 950),
      'Event tickets',
      cardPayment(random),
    );
  }

  // Shopping.
  if (random.chance(0.05 * season)) {
    add(
      random.int(8, 22),
      'Shopping',
      'Takealot',
      random.cents(150, 1800),
      'Online order',
      cardPayment(random),
    );
  }
  if (random.chance(0.06)) {
    add(
      random.int(9, 18),
      'Shopping',
      random.pick(['Clicks', 'Dis-Chem']),
      random.cents(80, 420),
      'Pharmacy and toiletries',
      cardPayment(random),
    );
  }
  if (random.chance(0.025 * season)) {
    add(
      random.int(10, 17),
      'Shopping',
      random.pick(['Mr Price', 'Woolworths', 'Superbalist']),
      random.cents(250, 1200),
      'Clothing',
      cardPayment(random),
    );
  }

  return entries;
}

/**
 * Generates a deterministic expense ledger. The same options always produce the
 * same transactions (ids, amounts and timestamps), sorted oldest first.
 */
export function generateLedger({ seed, startDate, endDate }: LedgerOptions): LedgerEntry[] {
  const random = createRandom(seed);
  const drafts: DraftEntry[] = [];
  const totalDays = diffInDays(startDate, endDate);

  for (let offset = 0; offset <= totalDays; offset += 1) {
    drafts.push(...generateDay(addDays(startDate, offset), random));
  }

  drafts.sort((a, b) => a.date.localeCompare(b.date));

  return drafts.map((draft, index) => ({
    ...draft,
    id: `txn_${String(100_001 + index)}`,
    localDate: toLocalDate(draft.date),
  }));
}
