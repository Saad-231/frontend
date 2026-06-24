import React from 'react';
import { AlertIcon, ClockIcon, PlusIcon, CloseIcon } from '../common/Icons.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import './LimitModal.css';

/**
 * Custom rate-limit modal. Shown when the user exceeds their daily
 * chat or image generation quota. Politely explains the limit and
 * the exact reset time, and offers a "Create a New Chat" CTA.
 */
export default function LimitModal({ payload, onClose }) {
  const { startNewChat } = useAppContext();
  const { kind, limit, resetAtFriendly, message } = payload;

  const handleNewChat = () => {
    startNewChat();
    onClose();
  };

  return (
    <div className="limit-modal" role="dialog" aria-modal="true" aria-labelledby="limit-modal-title">
      <div className="limit-modal__backdrop" onClick={onClose} />
      <div className="limit-modal__card">
        <button className="limit-modal__close" onClick={onClose} aria-label="Dismiss">
          <CloseIcon size={18} />
        </button>

        <div className="limit-modal__icon-wrap">
          <AlertIcon size={30} />
        </div>

        <h2 id="limit-modal-title" className="limit-modal__title">
          {kind === 'image' ? "You've reached today's image limit" : "You've reached today's chat limit"}
        </h2>

        <p className="limit-modal__message">
          {message} You can come back once your limit resets, or start a fresh conversation
          tomorrow.
        </p>

        <div className="limit-modal__reset-row">
          <ClockIcon size={15} />
          <span>
            Resets <strong>{resetAtFriendly}</strong>
          </span>
        </div>

        <div className="limit-modal__quota-pill">Daily limit: {limit} {kind === 'image' ? 'images' : 'messages'}</div>

        <div className="limit-modal__actions">
          <button className="limit-modal__btn limit-modal__btn--primary" onClick={handleNewChat}>
            <PlusIcon size={16} />
            Create a New Chat
          </button>
          <button className="limit-modal__btn limit-modal__btn--secondary" onClick={onClose}>
            Got it, I'll wait
          </button>
        </div>
      </div>
    </div>
  );
}
