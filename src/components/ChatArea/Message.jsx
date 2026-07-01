import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SpeakerIcon, SpeakerOffIcon, DownloadIcon, CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon, RegenerateIcon } from '../common/Icons.jsx';
import { useTypingCursor } from '../../hooks/useTypingCursor.js';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js';
import './Message.css';

export default function Message({ message, onRegenerate }) {
  const isUser = message.role === 'user';
  const isStreaming = Boolean(message.streaming);
  const cursorVisible = useTypingCursor(isStreaming);
  const { isSupported: ttsSupported, speakingId, speak } = useSpeechSynthesis();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isSpeaking = speakingId === message.id;
  const canReadAloud = !isUser && !isStreaming && message.type === 'text' && message.content;
  const canUseActions = !isUser && !isStreaming && message.type === 'text' && message.content;

  const isUrduOrHindi = /[\u0600-\u06FF\u0900-\u097F]/.test(message.content || '');

  const handleDownloadImage = (url, prompt) => {
    const link = document.createElement('a');
    link.href = url;
    const safeName = (prompt || 'novascribe-image').slice(0, 60).replace(/[^a-z0-9]+/gi, '-');
    link.download = `${safeName || 'novascribe-image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--assistant'}`}>
      {!isUser && (
        <img src="/favicon.svg" alt="NovaScribe" className="message__avatar message__avatar--bot" aria-hidden="true" />
      )}

      <div className="message__bubble">
        {message.type === 'image' ? (
          <div className="message__image-wrap">
            <img src={message.content} alt={message.prompt || 'Generated image'} />
            {message.prompt && <p className="message__image-caption">{message.prompt}</p>}
            <button
              className="message__download-btn"
              onClick={() => handleDownloadImage(message.content, message.prompt)}
              title="Download image"
              aria-label="Download image"
            >
              <DownloadIcon size={14} />
              <span>Download</span>
            </button>
          </div>
        ) : message.type === 'error' ? (
          <p className="message__error-text">{message.content}</p>
        ) : isUser ? (
          <p className="message__text">{message.content}</p>
        ) : (
          <div className="message__text message__markdown">
            <ReactMarkdown>{message.content || ''}</ReactMarkdown>
            {isStreaming && (
              <span className={`message__cursor ${cursorVisible ? 'message__cursor--on' : ''}`} />
            )}
          </div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="message__attachments">
            {message.attachments.map(function (att, idx) {
              return (
                 <a key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="message__attachment-pill"
                >
                  {att.originalName || 'Attachment'}
                </a>
              );
            })}
          </div>
        )}

        {(canReadAloud || canUseActions) && (
          <div className="message__actions">
            {canReadAloud && ttsSupported && (
              <button
                className={`message__action-btn ${isSpeaking ? 'message__action-btn--active' : ''}`}
                onClick={() => speak(message.id, message.content, isUrduOrHindi ? 'ur-PK' : 'en-US')}
                title={isSpeaking ? 'Stop reading aloud' : 'Read this message aloud'}
                aria-label={isSpeaking ? 'Stop reading aloud' : 'Read message aloud'}
              >
                {isSpeaking ? <SpeakerOffIcon size={15} /> : <SpeakerIcon size={15} />}
              </button>
            )}

            {canUseActions && (
              <>
                <button
                  className="message__action-btn"
                  onClick={handleCopy}
                  title="Copy"
                  aria-label="Copy response"
                >
                  {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
                </button>

                <button
                  className={`message__action-btn ${feedback === 'up' ? 'message__action-btn--active' : ''}`}
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  title="Good response"
                  aria-label="Like response"
                >
                  <ThumbsUpIcon size={15} />
                </button>

                <button
                  className={`message__action-btn ${feedback === 'down' ? 'message__action-btn--active' : ''}`}
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  title="Bad response"
                  aria-label="Dislike response"
                >
                  <ThumbsDownIcon size={15} />
                </button>

                {onRegenerate && (
                  <button
                    className="message__action-btn"
                    onClick={() => onRegenerate(message)}
                    title="Regenerate"
                    aria-label="Regenerate response"
                  >
                    <RegenerateIcon size={15} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
