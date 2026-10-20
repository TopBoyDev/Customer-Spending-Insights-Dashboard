import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../../services/error-reporter';
import { ErrorFallback } from './ErrorFallback';

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
    return <ErrorFallback />;
  }
}
