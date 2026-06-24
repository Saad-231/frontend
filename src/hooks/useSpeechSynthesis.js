import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Thin wrapper around the browser-native SpeechSynthesis API
 * (window.speechSynthesis) — used to read AI message text aloud.
 * No external text-to-speech library is used.
 */
export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speakingId, setSpeakingId] = useState(null);
  const utteranceRef = useRef(null);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [isSupported]);

  const speak = useCallback(
    (id, text) => {
      if (!isSupported || !text) return;

      // If this same message is already playing, stop it (toggle off).
      if (speakingId === id) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      utteranceRef.current = utterance;
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, speakingId, stop]
  );

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  return { isSupported, speakingId, speak, stop };
}
