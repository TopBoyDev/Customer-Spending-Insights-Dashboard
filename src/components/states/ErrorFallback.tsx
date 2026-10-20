import { Alert, Button, Container } from '@mui/material';
import { useMessages } from '../../i18n/I18nProvider';

/** Function component so the fallback can read localised copy via hooks. */
export function ErrorFallback() {
  const m = useMessages();
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            {m.states.reload}
          </Button>
        }
      >
        {m.states.unexpected}
      </Alert>
    </Container>
  );
}
