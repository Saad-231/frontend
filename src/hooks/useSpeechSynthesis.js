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

  // 🟢 یہاں 'lang' کا پیرامیٹر ایڈ کیا ہے جو آپ کی فکسڈ لینگویج لائے گا
  const speak = useCallback(
    (id, text, lang = 'en-US') => {
      if (!isSupported || !text) return;

      // If this same message is already playing, stop it (toggle off).
      if (speakingId === id) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();

      const cleanText = text.replace(/#{1,6}\s?/g, '').replace(/\*\*?(.*?)\*\*?/g, '$1');
const utterance = new window.SpeechSynthesisUtterance(cleanText);
      
      // 🟢 زبان سیٹ کر دی جو باہر سے آئے گی (جیسے 'ur-PK')
      utterance.lang = lang;
      
      // 🟢 اگر سسٹم میں اردو یا ہندی کی کوئی مخصوص آواز موجود ہو تو وہ اٹو-سلیکٹ ہو جائے
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.rate = 0.90;
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
