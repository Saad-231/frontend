import React, { useRef, useState, useEffect } from 'react';
import {
  PaperclipIcon,
  GalleryIcon,
  CameraIcon,
  SendIcon,
  MicIcon,
  StopIcon,
  ClockIcon,
  LiveChatIcon,
  CloseIcon,
} from '../common/Icons.jsx';
import { useCountdown } from '../../hooks/useCountdown.js';
import './InputBar.css';

const IMAGE_GEN_SECONDS = 14;

/**
 * Bottom input bar.
 *
 * Behavior per spec:
 *  - Empty input: shows attachment icons (Document/Link, Gallery, Camera)
 *    on the left, and Mic (voice recording) + Live chat icons on the right.
 *  - Once typing starts: Mic and Live chat both hide — only the Send
 *    button remains on the right.
 *  - While an image is generating, the Gallery/image-generate icon
 *    shows a live countdown ring + remaining seconds.
 */
export default function InputBar({
  onSendText,
  onGenerateImage,
  onOpenCamera,
  onOpenVoice,
  onOpenLiveChat,
  onFileSelected,
  isStreaming,
  onStop,
  isImageGenerating,
  imageGenSeconds,
  attachment,
  onRemoveAttachment,
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const countdown = useCountdown(imageGenSeconds || IMAGE_GEN_SECONDS);

  useEffect(() => {
    if (isImageGenerating) {
      countdown.start(imageGenSeconds || IMAGE_GEN_SECONDS);
    } else {
      countdown.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImageGenerating]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const isTextEmpty = value.trim().length === 0;
  // With an attachment staged, the user can send even without typing
  // anything (e.g. "just send this photo").
  const isEmpty = isTextEmpty && !attachment;

  const handleSend = () => {
    if (isEmpty || isStreaming) return;

    const trimmed = value.trim();
    if (trimmed.toLowerCase().startsWith('/image ')) {
      const prompt = trimmed.slice(7).trim();
      setValue('');
      if (prompt) onGenerateImage(prompt);
      return;
    }

    onSendText(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDocClick = () => fileInputRef.current?.click();

  const handleGalleryClick = () => {
    // If the user has already typed something, treat the Gallery icon as
    // the "generate an image from this prompt" action. If empty, fall
    // back to its other job: attaching an existing image file.
    if (!isTextEmpty) {
      const prompt = value.trim();
      setValue('');
      onGenerateImage(prompt);
    } else {
      galleryInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = '';
  };

  return (
    <p className="input-bar__footer-note">NovaScribe can make mistakes. Please double-check responses.</p>
      <div className="input-bar">
        {attachment && (
          <div className="input-bar__attachment-preview">
            {attachment.mimeType?.startsWith('image/') ? (
              <img
                src={attachment.url}
                alt={attachment.originalName || 'Attached image'}
                className="input-bar__attachment-thumb"
              />
            ) : (
              <div className="input-bar__attachment-doc">
                <PaperclipIcon size={16} />
              </div>
            )}
            <span className="input-bar__attachment-name">
              {attachment.originalName || 'Attachment'}
            </span>
            <button
              className="input-bar__attachment-remove"
              onClick={onRemoveAttachment}
              aria-label="Remove attachment"
              title="Remove attachment"
            >
              <CloseIcon size={13} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="input-bar__textarea"
          placeholder="Message NovaScribe… (try /image a neon cyberpunk city)"
          value={value}
          rows={1}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="input-bar__row">
          <div className="input-bar__icons-left">
            {/* Document / Link */}
            <button
              className="input-bar__icon-btn"
              onClick={handleDocClick}
              title="Attach a document or link"
              aria-label="Attach document or link"
            >
              <PaperclipIcon size={19} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv"
              className="visually-hidden"
              onChange={handleFileChange}
            />

            {/* Gallery / Images — doubles as the image-generation trigger,
                showing a countdown while generating */}
            <button
              className="input-bar__icon-btn input-bar__icon-btn--gallery"
              onClick={handleGalleryClick}
              disabled={isImageGenerating}
              title={isImageGenerating ? 'Generating image…' : 'Attach an image / generate art'}
              aria-label="Attach image or generate image"
            >
              {isImageGenerating ? (
                <span className="input-bar__countdown" title={`${countdown.secondsLeft}s remaining`}>
                  <svg viewBox="0 0 36 36" className="input-bar__countdown-ring">
                    <circle cx="18" cy="18" r="15.5" className="input-bar__countdown-track" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      className="input-bar__countdown-progress"
                      style={{
                        strokeDasharray: 2 * Math.PI * 15.5,
                        strokeDashoffset: 2 * Math.PI * 15.5 * (1 - countdown.progress),
                      }}
                    />
                  </svg>
                  <span className="input-bar__countdown-number">{countdown.secondsLeft}</span>
                </span>
              ) : (
                <GalleryIcon size={19} />
              )}
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={handleFileChange}
            />

            {/* Camera — activates live webcam overlay */}
            <button
              className="input-bar__icon-btn"
              onClick={onOpenCamera}
              title="Use your camera"
              aria-label="Open camera"
            >
              <CameraIcon size={19} />
            </button>
          </div>

          <div className="input-bar__icons-right">
            {isStreaming ? (
              <button className="input-bar__stop-btn" onClick={onStop} title="Stop generating">
                <StopIcon size={14} />
                <span>Stop</span>
              </button>
            ) : isEmpty ? (
              <>
                <button
                  className="input-bar__icon-btn input-bar__icon-btn--voice"
                  onClick={onOpenVoice}
                  title="Record a voice message"
                  aria-label="Record voice message"
                >
                  <MicIcon size={19} />
                </button>
                <button
                  className="input-bar__icon-btn input-bar__icon-btn--livechat"
                  onClick={onOpenLiveChat}
                  title="Start a live spoken conversation"
                  aria-label="Start live chat"
                >
                  <LiveChatIcon size={19} />
                </button>
              </>
            ) : (
              <button
                className="input-bar__send-btn"
                onClick={handleSend}
                title="Send message"
                aria-label="Send message"
              >
                <SendIcon size={17} />
              </button>
            )}
          </div>
        </div>
      </div>

      {isImageGenerating && (
        <p className="input-bar__hint">
          <ClockIcon size={12} /> Generating your image — about {countdown.secondsLeft}s left
        </p>
      )}
    </div>
  );
}
