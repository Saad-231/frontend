import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Generic countdown timer (in seconds) — used to show a visual
 * "time remaining" indicator on the attachment icon while an
 * image is being generated/uploaded.
 */
export function useCountdown(totalSeconds = 12) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (duration = totalSeconds) => {
      clear();
      setSecondsLeft(duration);
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clear();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear, totalSeconds]
  );

  const stop = useCallback(() => {
    clear();
    setIsRunning(false);
    setSecondsLeft(0);
  }, [clear]);

  useEffect(() => () => clear(), [clear]);

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  return { secondsLeft, isRunning, start, stop, progress };
}
