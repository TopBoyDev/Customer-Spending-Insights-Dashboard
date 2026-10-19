import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PERIODS, type Period } from '../../../shared/types';
import { PERIOD_SHORT_LABEL } from '../../utils/format';

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

/** Global period filter; drives the summary, categories and transactions together. */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      color="primary"
      aria-label="Spending period"
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
          {PERIOD_SHORT_LABEL[period]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
