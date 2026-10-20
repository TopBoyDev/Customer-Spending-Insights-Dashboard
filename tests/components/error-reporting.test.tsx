// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '../../src/components/states/ErrorBoundary';
import { reportError, resetErrorReporter } from '../../src/services/error-reporter';

let beacon: ReturnType<typeof vi.fn>;

/** jsdom's Blob has no .text(), so read it the browser-API way. */
function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

async function sentReports(): Promise<Record<string, unknown>[]> {
  return Promise.all(
    beacon.mock.calls.map(async ([, blob]) => JSON.parse(await readBlob(blob as Blob))),
  );
}

beforeEach(() => {
  resetErrorReporter();
  beacon = vi.fn(() => true);
  Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
});

afterEach(() => {
  Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
});

describe('reportError', () => {
  it('sends a structured report to the API', async () => {
    reportError(new TypeError('boom'), 'uncaught');
    expect(beacon).toHaveBeenCalledWith('/api/client-errors', expect.any(Blob));
    const [report] = await sentReports();
    expect(report).toMatchObject({
      kind: 'uncaught',
      message: 'boom',
      stack: expect.stringContaining('TypeError: boom'),
      url: expect.any(String),
      timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
  });

  it('de-duplicates identical errors and caps reports per page load', () => {
    reportError(new Error('same'), 'uncaught');
    reportError(new Error('same'), 'uncaught');
    expect(beacon).toHaveBeenCalledTimes(1);

    for (let index = 0; index < 20; index += 1) reportError(`error ${index}`, 'uncaught');
    expect(beacon).toHaveBeenCalledTimes(10);
  });

  it('falls back to fetch when sendBeacon is unavailable', () => {
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const fetchSpy = vi.fn(() => Promise.resolve(new Response(null, { status: 202 })));
    vi.stubGlobal('fetch', fetchSpy);
    reportError('offline', 'unhandledrejection');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/client-errors',
      expect.objectContaining({ method: 'POST', keepalive: true }),
    );
  });

  it('never throws, even for unusual values', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => reportError(circular, 'unhandledrejection')).not.toThrow();
  });
});

describe('ErrorBoundary', () => {
  it('shows a recovery message and reports the render error with its component stack', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function Broken(): never {
      throw new Error('render failed');
    }
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    const [report] = await sentReports();
    expect(report).toMatchObject({
      kind: 'render',
      message: 'render failed',
      componentStack: expect.stringContaining('Broken'),
    });
  });
});
