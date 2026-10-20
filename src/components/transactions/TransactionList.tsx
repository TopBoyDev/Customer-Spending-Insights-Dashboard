import { Box, Stack, Typography } from '@mui/material';
import { toLocalDate } from '../../../shared/dates';
import type { Transaction } from '../../../shared/types';
import { formatCurrency, formatDayHeading, formatTransactionTime } from '../../utils/format';
import { groupByDay } from '../../utils/transactions';
import { CategoryDot } from '../common/CategoryDot';
import { CategoryIcon } from '../common/CategoryIcon';

function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <Stack
      component="li"
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', py: 1.25, listStyle: 'none' }}
    >
      <CategoryIcon icon={transaction.icon} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {transaction.merchant}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <CategoryDot color={transaction.categoryColor} size={6} />
          <Typography variant="caption" component="p" noWrap>
            {transaction.category} · {formatTransactionTime(transaction.date)}
          </Typography>
        </Stack>
      </Box>
      <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
        −{formatCurrency(transaction.amount)}
      </Typography>
    </Stack>
  );
}

/**
 * Card list for small screens. When sorted by amount the date grouping would
 * be meaningless, so each card then shows its own date heading.
 */
export function TransactionList({
  transactions,
  groupByDate,
}: {
  transactions: Transaction[];
  groupByDate: boolean;
}) {
  const groups = groupByDate
    ? groupByDay(transactions)
    : transactions.map((transaction) => ({
        date: toLocalDate(transaction.date),
        transactions: [transaction],
      }));

  return (
    <Stack spacing={1.5}>
      {groups.map((group, index) => (
        <Box key={`${group.date}-${index}`}>
          <Typography
            variant="caption"
            component="h3"
            color="text.secondary"
            sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            {formatDayHeading(group.date)}
          </Typography>
          <Box
            component="ul"
            sx={{ m: 0, p: 0, '& > li + li': { borderTop: 1, borderColor: 'divider' } }}
          >
            {group.transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
