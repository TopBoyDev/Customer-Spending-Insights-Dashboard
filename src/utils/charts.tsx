import { tokens } from '../theme/theme';

/** useId() output contains ":" which is awkward inside url(#…); keep ids simple. */
export function svgSafeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Vertical brand gradient for bars. Returned as a plain <defs> element because
 * Recharts only renders chart children it recognises.
 */
export function barGradientDefs(id: string) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={tokens.color.accentLight} />
        <stop offset="100%" stopColor={tokens.color.accent} />
      </linearGradient>
    </defs>
  );
}
