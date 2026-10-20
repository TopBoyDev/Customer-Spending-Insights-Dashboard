/**
 * Minimal, vendor-neutral client error reporting. Reports go to our own API
 * (POST /api/client-errors), which keeps the Content Security Policy strict
 * and needs no third-party account. A hosted service such as Sentry could be
 * plugged in behind `reportError` without touching any call sites.
 */

export type ErrorKind = 'render' | 'uncaught' | 'unhandledrejection';

const ENDPOINT = '/api/client-errors';
/** Never send more than this many reports from one page load. */
const MAX_REPORTS = 10;

const sent = new Set<string>();
let sentCount = 0;

function truncate(value: string | undefined, max: number): string | undefined {
  return value === undefined ? undefined : value.slice(0, max);
}

function describe(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) return { message: error.message || error.name, stack: error.stack };
  if (typeof error === 'string') return { message: error };
  try {
    return { message: JSON.stringify(error) ?? String(error) };
  } catch {
    return { message: String(error) };
  }
}

function send(body: string): void {
  // sendBeacon survives page unloads; fall back to fetch where it is unavailable.
  const blob = new Blob([body], { type: 'application/json' });
  if (typeof navigator !== 'undefined' && navigator.sendBeacon?.(ENDPOINT, blob)) return;
  void fetch(ENDPOINT, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {
    // Reporting must never cause further errors.
  });
}

/** Reports an error once per message+kind, up to a per-page-load cap. Never throws. */
export function reportError(
  error: unknown,
  kind: ErrorKind,
  extra: { componentStack?: string } = {},
): void {
  try {
    const { message, stack } = describe(error);
    const fingerprint = `${kind}:${message}`;
    if (sent.has(fingerprint) || sentCount >= MAX_REPORTS) return;
    sent.add(fingerprint);
    sentCount += 1;

    send(
      JSON.stringify({
        kind,
        message: truncate(message, 1_000) || 'Unknown error',
        stack: truncate(stack, 8_000),
        componentStack: truncate(extra.componentStack, 8_000),
        url: truncate(window.location.href, 2_000),
        userAgent: truncate(navigator.userAgent, 500),
        timestamp: new Date().toISOString(),
      }),
    );
  } catch {
    // Swallow: error reporting is best effort.
  }
}

/** Captures errors that escape React (event handlers, async code, rejected promises). */
export function installGlobalErrorHandlers(): () => void {
  const onError = (event: ErrorEvent) => reportError(event.error ?? event.message, 'uncaught');
  const onRejection = (event: PromiseRejectionEvent) =>
    reportError(event.reason, 'unhandledrejection');
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}

/** Test helper: forget what has been sent. */
export function resetErrorReporter(): void {
  sent.clear();
  sentCount = 0;
}
