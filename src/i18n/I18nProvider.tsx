import { createContext, useContext, type ReactNode } from 'react';
import { en, type Messages } from './en';

const MessagesContext = createContext<Messages>(en);

/**
 * Supplies UI copy. Only English ships today; adding a language means adding a
 * `Messages` object (the compiler enforces completeness) and choosing it here.
 */
export function I18nProvider({
  messages = en,
  children,
}: {
  messages?: Messages;
  children: ReactNode;
}) {
  return <MessagesContext.Provider value={messages}>{children}</MessagesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useMessages(): Messages {
  return useContext(MessagesContext);
}
