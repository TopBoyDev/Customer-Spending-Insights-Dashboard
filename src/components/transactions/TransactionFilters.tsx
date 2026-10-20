import FilterListRounded from '@mui/icons-material/FilterListRounded';
import SwapVertRounded from '@mui/icons-material/SwapVertRounded';
import { Stack } from '@mui/material';
import { CATEGORIES, findCategoryName, type CategoryName } from '../../../shared/categories';
import { SORT_OPTIONS, type TransactionSort } from '../../../shared/types';
import { useFilterOptions } from '../../hooks/useInsightsQueries';
import { useMessages } from '../../i18n/I18nProvider';
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
  const m = useMessages();
  // The filters endpoint is the source of truth; fall back to the contract's list if it fails.
  const filters = useFilterOptions();
  const categories = filters.data?.categories ?? CATEGORIES;

  return (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <PillSelect
        label={m.transactions.category}
        icon={<FilterListRounded />}
        value={category ?? ALL}
        options={[
          { value: ALL, label: m.transactions.allCategories },
          ...categories.map((option) => ({
            value: option.name,
            label: option.name,
            dot: option.color,
          })),
        ]}
        onChange={(value) => onCategoryChange(findCategoryName(value) ?? null)}
      />
      <PillSelect
        label={m.transactions.sortBy}
        icon={<SwapVertRounded />}
        value={sortBy}
        options={SORT_OPTIONS.map((option) => ({
          value: option,
          label: m.transactions.sort[option],
        }))}
        onChange={onSortChange}
      />
    </Stack>
  );
}
