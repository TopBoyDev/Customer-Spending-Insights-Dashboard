import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { useId } from 'react';
import { CATEGORIES, findCategoryName, type CategoryName } from '../../../shared/categories';
import { SORT_OPTIONS, type TransactionSort } from '../../../shared/types';
import { useFilterOptions } from '../../hooks/useInsightsQueries';
import { SORT_LABELS } from '../../utils/format';

const ALL = 'all';

interface TransactionFiltersProps {
  category: CategoryName | null;
  sortBy: TransactionSort;
  onCategoryChange: (category: CategoryName | null) => void;
  onSortChange: (sortBy: TransactionSort) => void;
}

export function TransactionFilters({
  category,
  sortBy,
  onCategoryChange,
  onSortChange,
}: TransactionFiltersProps) {
  const categoryLabelId = useId();
  const sortLabelId = useId();
  // The filters endpoint is the source of truth; fall back to the contract's list if it fails.
  const filters = useFilterOptions();
  const categories = filters.data?.categories ?? CATEGORIES;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ width: { xs: '100%', sm: 'auto' } }}
    >
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id={categoryLabelId}>Category</InputLabel>
        <Select
          labelId={categoryLabelId}
          label="Category"
          value={category ?? ALL}
          onChange={(event) => onCategoryChange(findCategoryName(event.target.value) ?? null)}
        >
          <MenuItem value={ALL}>All categories</MenuItem>
          {categories.map((option) => (
            <MenuItem key={option.name} value={option.name}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel id={sortLabelId}>Sort by</InputLabel>
        <Select
          labelId={sortLabelId}
          label="Sort by"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as TransactionSort)}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {SORT_LABELS[option]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
