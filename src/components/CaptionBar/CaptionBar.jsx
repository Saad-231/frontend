import React, { useEffect } from 'react';
import { CaptionIcon, CloseIcon } from '../common/Icons.jsx';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import './CaptionBar.css';

/**
 * A live captions/subtitles bar pinned to the top of the chat interface.
 * Uses ONLY the browser-native Web Speech API (SpeechRecognition) —
 * no external speech-to-text library.
 */
export default function CaptionBar({ active, onClose }) {
  const { isSupported, isListening, transcript, start, stop } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
  });

  useEffect(() => {
    if (active && isSupported) {
      start();
    } else {
      stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isSupported]);

  if (!active) return null;

  return (
    <div className="caption-bar">
      <div className="caption-bar__indicator">
        <CaptionIcon size={15} />
        <span className={`caption-bar__dot ${isListening ? 'caption-bar__dot--live' : ''}`} />
      </div>

      <div className="caption-bar__text">
        {!isSupported ? (
          <span className="caption-bar__unsupported">
            Live captions aren't supported in this browser. Try Chrome or Edge.
          </span>
        ) : transcript ? (
          <span>{transcript}</span>
        ) : (
          <span className="caption-bar__placeholder">Listening for speech…</span>
        )}
      </div>

      <button className="caption-bar__close" onClick={onClose} aria-label="Close captions">
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
