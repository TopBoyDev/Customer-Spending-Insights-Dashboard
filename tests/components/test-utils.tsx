import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { ReactElement } from 'react';
import { afterAll, beforeAll, vi } from 'vitest';
import { createApp } from '../../server/app';
import { createDemoService } from '../../server/create-demo-service';
import { theme } from '../../src/theme/theme';

type Override = (url: URL) => Response | undefined;

/**
 * Serves the real mock API on an ephemeral port and points the app's relative
 * `/api` requests at it, so component tests exercise real contract data.
 * Individual tests can override responses to simulate errors or empty data.
 */
export function setupMockApi() {
  let server: Server;
  let origin = '';
  const overrides: Override[] = [];
  const requests: URL[] = [];
  const realFetch = globalThis.fetch;

  beforeAll(async () => {
    const app = createApp({ service: createDemoService('2026-10-19') });
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  function install() {
    overrides.length = 0;
    requests.length = 0;
    vi.stubGlobal('fetch', async (input: string, init?: RequestInit) => {
      const url = new URL(input, origin);
      requests.push(url);
      for (const override of overrides) {
        const response = override(url);
        if (response) return response;
      }
      // jsdom's AbortSignal is not accepted by Node's fetch; aborting is not under test here.
      return realFetch(url, { headers: init?.headers });
    });
  }

  return {
    install,
    requests,
    override(override: Override) {
      overrides.push(override);
    },
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function renderWithProviders(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return {
    client,
    ...render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={client}>{ui}</QueryClientProvider>
      </ThemeProvider>,
    ),
  };
}

/** Intl separates thousands with non-breaking spaces; match them as regular spaces. */
export function money(text: string): RegExp {
  return new RegExp(text.replace(/ /g, '\\s').replace(/,/g, ','));
}
