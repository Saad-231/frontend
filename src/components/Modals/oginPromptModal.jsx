import React, { useEffect, useRef } from 'react';
import { CloseIcon } from '../common/Icons.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import './LoginPromptModal.css';

const GOOGLE_CLIENT_ID = '252649808144-3cpsurc2ckni4vmjos3if02hlfanh7ja.apps.googleusercontent.com';

export default function LoginPromptModal() {
  const { showLoginPrompt, setShowLoginPrompt, login } = useAppContext();
  const btnRef = useRef(null);

  useEffect(() => {
    if (!showLoginPrompt || !window.google || !btnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch(
            (import.meta.env.VITE_API_BASE_URL || 'https://backend-ivory-nine-55.vercel.app') + '/api/auth/google',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            }
          );
          const data = await res.json();
          if (data.token) login(data.user, data.token);
        } catch (err) {
          console.error('Google login failed', err);
        }
      },
    });
    window.google.accounts.id.renderButton(btnRef.current, { theme: 'filled_blue', size: 'large', shape: 'pill' });
  }, [showLoginPrompt, login]);

  if (!showLoginPrompt) return null;

  return (
    <div className="login-prompt-overlay">
      <div className="login-prompt-card">
        <button className="login-prompt-close" onClick={() => setShowLoginPrompt(false)}>
          <CloseIcon size={18} />
        </button>
        <h2>Want more generations?</h2>
        <p>Sign in with Google to keep chatting and generating images on NovaScribe.AI.</p>
        <div ref={btnRef} className="login-prompt-google-btn" />
      </div>
    </div>
  );
}
