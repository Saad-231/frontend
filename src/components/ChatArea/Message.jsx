import React from 'react';
import ReactMarkdown from 'react-markdown';
import { SpeakerIcon, SpeakerOffIcon, DownloadIcon } from '../common/Icons.jsx';
import { useTypingCursor } from '../../hooks/useTypingCursor.js';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js';
import './Message.css';

export default function Message({ message }) {
  const isUser = message.role === 'user';
  const isStreaming = Boolean(message.streaming);
  const cursorVisible = useTypingCursor(isStreaming);
  const { isSupported: ttsSupported, speakingId, speak } = useSpeechSynthesis();

  const isSpeaking = speakingId === message.id;
  const canReadAloud = !isUser && !isStreaming && message.type === 'text' && message.content;

  const handleDownloadImage = (url, prompt) => {
    const link = document.createElement('a');
    link.href = url;
    const safeName = (prompt || 'novascribe-image').slice(0, 60).replace(/[^a-z0-9]+/gi, '-');
    link.download = `${safeName || 'novascribe-image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {message.attachments?.length > 0 && (
          <div className="message__attachments">
            {message.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="message__attachment-pill"
              >
                {att.originalName || 'Attachment'}
              </a>
            ))}
          </div>
        )}

        {canReadAloud && ttsSupported && (
          <button
            className={`message__speak-btn ${isSpeaking ? 'message__speak-btn--active' : ''}`}
            onClick={() => speak(message.id, message.content)}
            title={isSpeaking ? 'Stop reading aloud' : 'Read this message aloud'}
            aria-label={isSpeaking ? 'Stop reading aloud' : 'Read message aloud'}
          >
            {isSpeaking ? <SpeakerOffIcon size={14} /> : <SpeakerIcon size={14} />}
            <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
