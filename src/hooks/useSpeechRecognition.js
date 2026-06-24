import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Thin wrapper around the browser-native Web Speech API
 * (SpeechRecognition / webkitSpeechRecognition).
 *
 * No external STT library is used — this satisfies the requirement
 * of using only the native API for live transcription/captions.
 *
 * Returns:
 *  - isSupported: boolean
 *  - isListening: boolean
 *  - transcript: the running interim+final transcript text
 *  - finalTranscript: only finalized (committed) text
 *  - start(), stop(), reset()
 */
export function useSpeechRecognition({ continuous = true, interimResults = true, lang = 'en-US' } = {}) {
  const RecognitionCtor =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const isSupported = Boolean(RecognitionCtor);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return;

    const recognition = new RecognitionCtor();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setFinalTranscript((prev) => `${prev} ${final}`.trim());
      }
      setTranscript(`${final} ${interim}`.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // auto-restart while "listening" is still desired (continuous mode
      // sometimes ends unexpectedly in some browsers)
      if (isListening) {
        try {
          recognition.start();
        } catch {
          /* already started */
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, continuous, interimResults, lang]);

  const start = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    setError(null);
    setTranscript('');
    setFinalTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      /* recognition may already be running */
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    try {
      recognitionRef.current.stop();
    } catch {
      /* noop */
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  return { isSupported, isListening, transcript, finalTranscript, error, start, stop, reset };
}
