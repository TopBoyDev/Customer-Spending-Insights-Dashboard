import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PERIODS, type Period } from '../../../shared/types';
import { useMessages } from '../../i18n/I18nProvider';

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

/** Global period filter; drives the summary, categories and transactions together. */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const m = useMessages();
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      color="primary"
      aria-label={m.period.group}
      onChange={(_event, next: Period | null) => {
        // Exclusive toggle groups emit null when the active button is clicked again.
        if (next) onChange(next);
      }}
      sx={{ bgcolor: 'background.paper', width: { xs: '100%', sm: 'auto' } }}
    >
      {PERIODS.map((period) => (
        <ToggleButton
          key={period}
          value={period}
          sx={{ flex: { xs: 1, sm: 'initial' }, whiteSpace: 'nowrap' }}
        >
          {m.period.short[period]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
