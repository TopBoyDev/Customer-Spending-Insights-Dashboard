import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  daysInMonth,
  diffInDays,
  isValidIsoDate,
  toLocalDate,
} from '../../shared/dates';

describe('isValidIsoDate', () => {
  it.each(['2024-02-29', '2026-10-19', '2000-02-29'])('accepts %s', (value) => {
    expect(isValidIsoDate(value)).toBe(true);
  });

  it.each([
    '2023-02-29',
    '2024-02-30',
    '2024-13-01',
    '2024-1-01',
    '19-10-2026',
    '',
    'abc',
    '2024-09-16T00:00:00Z',
  ])('rejects %s', (value) => {
    expect(isValidIsoDate(value)).toBe(false);
  });
});

describe('calendar arithmetic', () => {
  it('crosses month, year and leap-day boundaries', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(diffInDays('2025-12-31', '2026-01-02')).toBe(2);
  });

  it('adds months across years', () => {
    expect(addMonths('2026-10', -11)).toBe('2025-11');
    expect(addMonths('2025-12', 1)).toBe('2026-01');
  });

  it('knows month lengths, including leap years', () => {
    expect(daysInMonth('2024-02')).toBe(29);
    expect(daysInMonth('2025-02')).toBe(28);
    expect(daysInMonth('2026-10')).toBe(31);
  });
});

describe('toLocalDate (Africa/Johannesburg)', () => {
  it('maps late-evening UTC instants to the next local day', () => {
    // 22:30 UTC is 00:30 SAST on the following day.
    expect(toLocalDate('2024-09-15T22:30:00Z')).toBe('2024-09-16');
    expect(toLocalDate('2024-09-15T21:59:59Z')).toBe('2024-09-15');
  });

  it('handles the year boundary', () => {
    expect(toLocalDate('2025-12-31T22:00:00Z')).toBe('2026-01-01');
  });
});
