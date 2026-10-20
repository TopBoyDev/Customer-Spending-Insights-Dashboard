import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { Transaction } from '../../../shared/types';
import { formatCurrency, formatTransactionDate, formatTransactionTime } from '../../utils/format';
import { visuallyHiddenSx } from '../../utils/a11y';
import { CategoryDot } from '../common/CategoryDot';
import { CategoryIcon } from '../common/CategoryIcon';

/** Semantic table for wider screens. */
export function TransactionTable({
  transactions,
  caption,
}: {
  transactions: Transaction[];
  caption: string;
}) {
  return (
    <TableContainer>
      <Table size="small" sx={{ '& td, & th': { py: 1.25 } }}>
        <Box component="caption" sx={visuallyHiddenSx}>
          {caption}
        </Box>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              Date
            </TableCell>
            <TableCell component="th" scope="col">
              Merchant
            </TableCell>
            <TableCell component="th" scope="col">
              Category
            </TableCell>
            <TableCell component="th" scope="col">
              Payment method
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              Amount
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <Typography variant="body2">{formatTransactionDate(transaction.date)}</Typography>
                <Typography variant="caption" component="p">
                  {formatTransactionTime(transaction.date)}
                </Typography>
              </TableCell>
              <TableCell component="th" scope="row" sx={{ fontWeight: 400 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <CategoryIcon icon={transaction.icon} size={32} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {transaction.merchant}
                    </Typography>
                    <Typography variant="caption" component="p">
                      {transaction.description}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CategoryDot color={transaction.categoryColor} />
                  <Typography variant="body2">{transaction.category}</Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {transaction.paymentMethod}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                −{formatCurrency(transaction.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
