import React, { useState } from 'react';
import { CloseIcon } from '../common/Icons.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import './SettingsModal.css';

export default function SettingsModal({ onClose }) {
  const { user, logout, theme, setTheme } = useAppContext();
  const [feedbackText, setFeedbackText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendFeedback = async (type) => {
    if (!feedbackText.trim()) return;
    setSending(true);
    try {
      await fetch('https://backend-ivory-nine-55.vercel.app/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: feedbackText,
          userEmail: user?.email,
          userName: user?.name,
          type,
        }),
      });
      setSent(true);
      setFeedbackText('');
    } catch {
      setSent(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        {user && (
          <div className="settings-profile">
            {user.picture && <img src={user.picture} alt={user.name} />}
            <div>
              <p className="settings-profile-name">{user.name}</p>
              <p className="settings-profile-email">{user.email}</p>
            </div>
          </div>
        )}

        <div className="settings-row">
          <span>Theme</span>
          <div className="settings-theme-toggle">
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>
              Dark
            </button>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>
              Light
            </button>
          </div>
        </div>

        <div className="settings-row">
          <span>Language</span>
          <select className="settings-select" defaultValue="en">
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </div>

        <div className="settings-feedback">
          <textarea
            placeholder="Send feedback or a help request..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <div className="settings-feedback-actions">
            <button onClick={() => sendFeedback('feedback')} disabled={sending}>
              Send Feedback
            </button>
            <button onClick={() => sendFeedback('help')} disabled={sending}>
              Get Help
            </button>
          </div>
          {sent && <p className="settings-feedback-sent">Sent — thank you!</p>}
        </div>

        {user && (
          <button
            className="settings-logout"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}
