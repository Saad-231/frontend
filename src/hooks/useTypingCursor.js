import { useEffect, useState } from 'react';

/**
 * Lightweight blinking-cursor effect for messages currently streaming in.
 * The actual word-by-word reveal comes from the socket pushing tokens
 * progressively (see useChatSocket) — this hook just drives the
 * blinking caret visual that sits at the end of the in-progress text.
 */
export function useTypingCursor(isStreaming) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isStreaming) return undefined;
    const id = setInterval(() => setVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, [isStreaming]);

  return isStreaming ? visible : false;
}
