import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Browser APIs that jsdom does not implement but MUI and Recharts use.
if (typeof window !== 'undefined') {
  // Testing Library only auto-cleans when Vitest globals are enabled.
  const { cleanup } = await import('@testing-library/react');
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, '', '/');
  });

  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

  Element.prototype.scrollIntoView ??= () => {};
  // jsdom defines scrollTo but throws "not implemented".
  window.scrollTo = () => {};
}
