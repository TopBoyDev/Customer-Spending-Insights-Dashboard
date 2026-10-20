import '@fontsource-variable/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/states/ErrorBoundary';
import { I18nProvider } from './i18n/I18nProvider';
import { installGlobalErrorHandlers } from './services/error-reporter';
import { createQueryClient } from './services/query-client';
import { ColorModeProvider } from './theme/ColorModeProvider';

installGlobalErrorHandlers();

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <ColorModeProvider>
        <ErrorBoundary>
          <QueryClientProvider client={createQueryClient()}>
            <App />
          </QueryClientProvider>
        </ErrorBoundary>
      </ColorModeProvider>
    </I18nProvider>
  </StrictMode>,
);
