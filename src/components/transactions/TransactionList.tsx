import { Box, Stack, Typography } from '@mui/material';
import type { Transaction } from '../../../shared/types';
import {
  formatCurrency,
  formatDayHeading,
  formatTransactionDayMonth,
  formatTransactionTime,
} from '../../utils/format';
import { groupByDay } from '../../utils/transactions';
import { CategoryDot } from '../common/CategoryDot';
import { CategoryIcon } from '../common/CategoryIcon';

function TransactionRow({
  transaction,
  showDate,
}: {
  transaction: Transaction;
  showDate: boolean;
}) {
  const when = showDate
    ? formatTransactionDayMonth(transaction.date)
    : formatTransactionTime(transaction.date);
  return (
    <Stack
      component="li"
      direction="row"
      spacing={1.75}
      sx={{ alignItems: 'center', py: 1.75, listStyle: 'none' }}
    >
      <CategoryIcon icon={transaction.icon} size={42} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.9375rem', mb: 0.375 }}>
          {transaction.merchant}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <CategoryDot color={transaction.categoryColor} size={6} />
          <Typography variant="caption" component="p" noWrap>
            {transaction.category} · {when}
          </Typography>
        </Stack>
      </Box>
      <Typography
        variant="subtitle2"
        sx={{ whiteSpace: 'nowrap', fontSize: '0.9375rem', fontWeight: 700 }}
      >
        −{formatCurrency(transaction.amount)}
      </Typography>
    </Stack>
  );
}

const rowListSx = {
  m: 0,
  p: 0,
  '& > li + li': { borderTop: 1, borderColor: 'divider' },
} as const;

/**
 * Card list for small screens. Sorted by date, rows are grouped under day
 * headings; sorted by amount, grouping would be meaningless, so it is a flat
 * list with the date shown on each row.
 */
export function TransactionList({
  transactions,
  groupByDate,
}: {
  transactions: Transaction[];
  groupByDate: boolean;
}) {
  if (!groupByDate) {
    return (
      <Box component="ul" sx={rowListSx}>
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} showDate />
        ))}
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {groupByDay(transactions).map((group) => (
        <Box key={group.date}>
          <Typography
            variant="caption"
            component="h3"
            sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
          >
            {formatDayHeading(group.date)}
          </Typography>
          <Box component="ul" sx={rowListSx}>
            {group.transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} showDate={false} />
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
