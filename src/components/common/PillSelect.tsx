import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, InputBase, MenuItem, Select, Stack } from '@mui/material';
import { useId, type ReactNode } from 'react';
import { tokens } from '../../theme/theme';
import { visuallyHiddenSx } from '../../utils/a11y';
import { CategoryDot } from './CategoryDot';

export interface PillOption<T extends string> {
  value: T;
  label: string;
  /** Optional colour marker shown before the label. */
  dot?: string;
}

interface PillSelectProps<T extends string> {
  /** Accessible name. Not shown visually: the icon and current value make the purpose clear. */
  label: string;
  icon: ReactNode;
  value: T;
  options: PillOption<T>[];
  onChange: (value: T) => void;
}

/** Compact filter control in the style of modern dashboards. */
export function PillSelect<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
}: PillSelectProps<T>) {
  const labelId = useId();
  return (
    <>
      <Box component="span" id={labelId} sx={visuallyHiddenSx}>
        {label}
      </Box>
      <Select
        labelId={labelId}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        IconComponent={KeyboardArrowDownRounded}
        input={<InputBase />}
        renderValue={(selected) => {
          const option = options.find((item) => item.value === selected);
          return (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                component="span"
                aria-hidden
                sx={{ display: 'flex', color: 'text.secondary', '& svg': { fontSize: 18 } }}
              >
                {icon}
              </Box>
              {option?.dot && <CategoryDot color={option.dot} />}
              <span>{option?.label}</span>
            </Stack>
          );
        }}
        sx={{
          height: 40,
          minWidth: 170,
          borderRadius: `${tokens.radius.control}px`,
          bgcolor: tokens.color.surfaceMuted,
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'background-color 150ms',
          '&:hover': { bgcolor: '#ECEFF3' },
          '&.Mui-focused': { boxShadow: `0 0 0 2px ${tokens.color.accentLight}` },
          '& .MuiSelect-select': { pl: 1.5, pr: '36px !important', py: 0 },
          '& .MuiSelect-icon': { right: 10, color: 'text.secondary', fontSize: 20 },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              {option.dot && <CategoryDot color={option.dot} />}
              <span>{option.label}</span>
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
