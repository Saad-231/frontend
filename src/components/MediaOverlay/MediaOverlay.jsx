import React, { useEffect, useState, useRef } from 'react';
import { MuteIcon, MicIcon, CloseIcon, CameraIcon, CheckIcon } from '../common/Icons.jsx';
import { useCamera } from '../../hooks/useCamera.js';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import './MediaOverlay.css';

/**
 * Full-screen overlay shown while recording voice, using the live
 * webcam, or having a live spoken conversation. Per spec: exactly two
 * controls sit in the center — a Mute button and a Close (✕) button
 * to dismiss the action.
 *
 * mode: 'voice' | 'camera' | 'livechat'
 *
 * 'livechat' is a continuous, hands-free conversation: it listens,
 * auto-sends what you say after a pause, waits for the AI's reply,
 * speaks the reply aloud (native SpeechSynthesis), then resumes
 * listening automatically — like talking to a voice assistant.
 */
export default function MediaOverlay({
  mode,
  onClose,
  onVoiceResult,
  onPhotoCapture,
  onLiveChatUtterance,
  liveChatStatus, // 'listening' | 'thinking' | 'speaking' (controlled by parent)
  liveChatReplyText,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const silenceTimerRef = useRef(null);
  const lastSentRef = useRef('');

  const camera = useCamera();
  const speech = useSpeechRecognition({ continuous: true, interimResults: true });
  const liveSpeech = useSpeechRecognition({ continuous: true, interimResults: true });

  // Mount/unmount: start the right recognizer for the current mode.
  // Live-chat's start/stop while listening vs. thinking/speaking is
  // handled by the single effect below instead, to avoid calling
  // .start()/.stop() from two different effects in quick succession
  // (which can throw or silently desync the underlying recognizer).
  useEffect(() => {
    if (mode === 'camera') {
      camera.start();
    } else if (mode === 'voice' && !isMuted) {
      speech.start();
    }
    return () => {
      camera.stop();
      speech.stop();
      liveSpeech.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Live-chat: auto-send after ~1.1s of silence following speech.
  useEffect(() => {
    if (mode !== 'livechat' || isMuted) return;
    if (liveChatStatus !== 'listening') return;

    const text = liveSpeech.transcript.trim();
    if (!text || text === lastSentRef.current) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      const finalText = liveSpeech.transcript.trim();
      if (finalText && finalText !== lastSentRef.current) {
        lastSentRef.current = finalText;
        liveSpeech.reset();
        onLiveChatUtterance(finalText);
      }
    }, 1100);

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSpeech.transcript, mode, isMuted, liveChatStatus]);

  // Single source of truth for starting/stopping the live-chat mic:
  // listening while status is 'listening' and not muted; stopped while
  // the AI is 'thinking' or 'speaking', or while muted. This is the
  // ONLY place that calls liveSpeech.start()/.stop() for livechat mode,
  // which avoids the start/stop race that caused the mic to silently
  // stop transcribing and replies to land only in the text chat instead
  // of being spoken back.
  useEffect(() => {
    if (mode !== 'livechat') return;
    if (isMuted) {
      liveSpeech.stop();
      return;
    }
    if (liveChatStatus === 'listening') {
      liveSpeech.start();
    } else {
      liveSpeech.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, liveChatStatus, isMuted]);

  const handleMuteToggle = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (mode === 'voice') {
        if (next) speech.stop();
        else speech.start();
      }
      // For 'livechat', the consolidated effect above reacts to the
      // isMuted change and starts/stops the recognizer itself — calling
      // it here too would race with that effect.
      return next;
    });
  };

  const handleClose = () => {
    camera.stop();
    speech.stop();
    liveSpeech.stop();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    onClose();
  };

  const handleCapture = () => {
    const dataUrl = camera.capturePhoto();
    if (dataUrl) onPhotoCapture(dataUrl);
    handleClose();
  };

  const handleConfirmVoice = () => {
    const text = (speech.finalTranscript || speech.transcript || '').trim();
    if (text) onVoiceResult(text);
    handleClose();
  };

  const liveChatLabel = !liveSpeech.isSupported
    ? 'Live chat needs a browser that supports speech recognition — try Chrome or Edge.'
    : liveSpeech.error === 'not-allowed' || liveSpeech.error === 'service-not-allowed'
    ? 'Microphone access was blocked. Please allow microphone permission in your browser and try again.'
    : liveChatStatus === 'thinking'
    ? 'Thinking…'
    : liveChatStatus === 'speaking'
    ? 'Speaking…'
    : isMuted
    ? 'Microphone muted'
    : liveSpeech.transcript || 'Listening… just start talking';

  return (
    <div className="media-overlay" role="dialog" aria-modal="true">
      <div className="media-overlay__backdrop" />

      <div className="media-overlay__content">
        {mode === 'camera' && (
          <div className="media-overlay__camera-frame">
            {camera.error ? (
              <p className="media-overlay__error">{camera.error}</p>
            ) : (
              <video ref={camera.videoRef} autoPlay playsInline muted className="media-overlay__video" />
            )}
          </div>
        )}

        {mode === 'voice' && (
          <div className="media-overlay__voice-frame">
            <div className={`media-overlay__pulse ${isMuted ? 'media-overlay__pulse--muted' : ''}`}>
              <MicIcon size={36} />
            </div>
            <p className="media-overlay__transcript">
              {!speech.isSupported
                ? 'Voice input needs a browser that supports speech recognition — try Chrome or Edge.'
                : speech.error === 'not-allowed' || speech.error === 'service-not-allowed'
                ? 'Microphone access was blocked. Please allow microphone permission in your browser and try again.'
                : speech.transcript || (isMuted ? 'Microphone muted' : 'Listening…')}
            </p>
          </div>
        )}

        {mode === 'livechat' && (
          <div className="media-overlay__voice-frame">
            <div
              className={`media-overlay__pulse ${
                liveChatStatus === 'speaking'
                  ? 'media-overlay__pulse--speaking'
                  : isMuted || liveChatStatus !== 'listening'
                  ? 'media-overlay__pulse--muted'
                  : ''
              }`}
            >
              <MicIcon size={36} />
            </div>
            <p className="media-overlay__transcript">
              {liveChatStatus === 'speaking' && liveChatReplyText ? liveChatReplyText : liveChatLabel}
            </p>
          </div>
        )}

        {/* Secondary action — capture/confirm — kept visually distinct from the
            two required center controls below. */}
        {mode === 'camera' && !camera.error && (
          <button className="media-overlay__capture-btn" onClick={handleCapture}>
            <CameraIcon size={18} />
            Capture
          </button>
        )}
        {mode === 'voice' && (speech.transcript || speech.finalTranscript) && (
          <button className="media-overlay__capture-btn" onClick={handleConfirmVoice}>
            <CheckIcon size={18} />
            Use this
          </button>
        )}

        {/* Required controls: exactly Mute + Close, centered */}
        <div className="media-overlay__controls">
          <button
            className={`media-overlay__control-btn ${isMuted ? 'media-overlay__control-btn--active' : ''}`}
            onClick={handleMuteToggle}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <MuteIcon size={22} />
          </button>

          <button
            className="media-overlay__control-btn media-overlay__control-btn--close"
            onClick={handleClose}
            aria-label="Close"
            title="Close"
          >
            <CloseIcon size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
