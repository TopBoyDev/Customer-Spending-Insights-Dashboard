import { Alert, Button, Container } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../../services/error-reporter';

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Last-resort fallback for unexpected rendering errors. */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unexpected rendering error', error, info.componentStack);
    reportError(error, 'render', { componentStack: info.componentStack ?? undefined });
  }

  override render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        >
          Something unexpected went wrong while showing your spending insights. Reloading the page
          usually fixes this.
        </Alert>
      </Container>
    );
  }
}
