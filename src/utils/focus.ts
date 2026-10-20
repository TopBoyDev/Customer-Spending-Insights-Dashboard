/**
 * Moves focus to the element with `id` as soon as it exists (immediately if it
 * already does). Returns a cleanup function that stops waiting.
 */
export function focusWhenAvailable(id: string, timeoutMs = 5_000): () => void {
  const focus = () => {
    const element = document.getElementById(id);
    if (!element) return false;
    element.focus({ preventScroll: true });
    return true;
  };
  if (focus()) return () => {};

  const observer = new MutationObserver(() => {
    if (focus()) stop();
  });
  const timer = window.setTimeout(() => stop(), timeoutMs);
  function stop() {
    observer.disconnect();
    window.clearTimeout(timer);
  }
  observer.observe(document.body, { childList: true, subtree: true });
  return stop;
}
