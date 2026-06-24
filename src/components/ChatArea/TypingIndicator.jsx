import React from 'react';
import './TypingIndicator.css';

/**
 * Shown briefly between sending a message and the first streamed token
 * arriving. Per spec, this is an animated indicator (not a static
 * spinner) consistent with the word-by-word streaming feel.
 */
export default function TypingIndicator() {
  return (
    <div className="typing-indicator" aria-label="NovaScribe is thinking">
      <span className="typing-indicator__dot" />
      <span className="typing-indicator__dot" />
      <span className="typing-indicator__dot" />
    </div>
  );
}
