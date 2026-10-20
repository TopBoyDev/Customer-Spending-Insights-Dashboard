// @vitest-environment jsdom
import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PeriodSelector } from '../../src/components/dashboard/PeriodSelector';
import { StatusLabel } from '../../src/components/common/StatusLabel';
import { en, type Messages } from '../../src/i18n/en';
import { I18nProvider } from '../../src/i18n/I18nProvider';
import { theme } from '../../src/theme/theme';

/** A pseudo-locale proves components read copy from the provider, not literals. */
const pseudo: Messages = {
  ...en,
  period: {
    ...en.period,
    group: '[Bestedingstydperk]',
    short: { '7d': '[7 dae]', '30d': '[30 dae]', '90d': '[90 dae]', '1y': '[1 jaar]' },
  },
  budgets: { ...en.budgets, status: { ...en.budgets.status, exceeded: '[Oor begroting]' } },
};

describe('I18nProvider', () => {
  it('renders copy from the supplied catalogue', () => {
    render(
      <ThemeProvider theme={theme}>
        <I18nProvider messages={pseudo}>
          <PeriodSelector value="30d" onChange={() => {}} />
          <StatusLabel status="exceeded" />
        </I18nProvider>
      </ThemeProvider>,
    );
    expect(screen.getByRole('group', { name: '[Bestedingstydperk]' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '[7 dae]' })).toBeInTheDocument();
    expect(screen.getByText('[Oor begroting]')).toBeInTheDocument();
  });

  it('defaults to English without a provider', () => {
    render(
      <ThemeProvider theme={theme}>
        <PeriodSelector value="30d" onChange={() => {}} />
      </ThemeProvider>,
    );
    expect(screen.getByRole('group', { name: 'Spending period' })).toBeInTheDocument();
  });
});
