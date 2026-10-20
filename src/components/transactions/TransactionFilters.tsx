import FilterListRounded from '@mui/icons-material/FilterListRounded';
import SwapVertRounded from '@mui/icons-material/SwapVertRounded';
import { Stack } from '@mui/material';
import { CATEGORIES, findCategoryName, type CategoryName } from '../../../shared/categories';
import { SORT_OPTIONS, type TransactionSort } from '../../../shared/types';
import { useFilterOptions } from '../../hooks/useInsightsQueries';
import { SORT_LABELS } from '../../utils/format';
import { PillSelect } from '../common/PillSelect';

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
  // The filters endpoint is the source of truth; fall back to the contract's list if it fails.
  const filters = useFilterOptions();
  const categories = filters.data?.categories ?? CATEGORIES;

  return (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <PillSelect
        label="Category"
        icon={<FilterListRounded />}
        value={category ?? ALL}
        options={[
          { value: ALL, label: 'All categories' },
          ...categories.map((option) => ({
            value: option.name,
            label: option.name,
            dot: option.color,
          })),
        ]}
        onChange={(value) => onCategoryChange(findCategoryName(value) ?? null)}
      />
      <PillSelect
        label="Sort by"
        icon={<SwapVertRounded />}
        value={sortBy}
        options={SORT_OPTIONS.map((option) => ({ value: option, label: SORT_LABELS[option] }))}
        onChange={onSortChange}
      />
    </Stack>
  );
}
