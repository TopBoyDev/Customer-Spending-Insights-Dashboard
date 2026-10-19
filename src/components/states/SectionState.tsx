import InboxOutlined from '@mui/icons-material/InboxOutlined';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { visuallyHiddenSx } from '../../utils/a11y';

interface ErrorStateProps {
  title?: string;
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  title = 'This section could not be loaded',
  error,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  const message = error instanceof Error ? error.message : 'Please try again.';
  return (
    <Alert
      severity="error"
      variant="outlined"
      action={
        <Button color="inherit" size="small" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? 'Retrying…' : 'Try again'}
        </Button>
      }
    >
      <Typography variant="subtitle2" component="p">
        {title}
      </Typography>
      <Typography variant="body2">{message}</Typography>
    </Alert>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack
      spacing={1}
      sx={{ alignItems: 'center', textAlign: 'center', py: 4, px: 2, color: 'text.secondary' }}
    >
      <InboxOutlined aria-hidden sx={{ fontSize: 40, color: 'text.disabled' }} />
      <Typography variant="subtitle1" component="p" color="text.primary">
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}

/** Generic block skeleton used while a section's first request is in flight. */
export function BlockSkeleton({ lines = 3, height = 160 }: { lines?: number; height?: number }) {
  return (
    <Stack spacing={1.5} aria-hidden>
      <Skeleton variant="rounded" height={height} />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} variant="text" width={`${90 - index * 15}%`} />
      ))}
    </Stack>
  );
}

interface SectionStateProps<T> {
  query: UseQueryResult<T>;
  /** Accessible description of what is loading, e.g. "Loading spending summary". */
  loadingLabel: string;
  skeleton?: ReactNode;
  errorTitle?: string;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * Renders the loading, error, empty or success state of a single section, so
 * a failure in one widget never removes the others.
 */
export function SectionState<T>({
  query,
  loadingLabel,
  skeleton,
  errorTitle,
  isEmpty,
  empty,
  children,
}: SectionStateProps<T>) {
  if (query.isPending) {
    return (
      <Box role="status" aria-live="polite" aria-busy="true">
        <Box component="span" sx={visuallyHiddenSx}>
          {loadingLabel}
        </Box>
        {skeleton ?? <BlockSkeleton />}
      </Box>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        title={errorTitle}
        error={query.error}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    );
  }

  if (isEmpty?.(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
