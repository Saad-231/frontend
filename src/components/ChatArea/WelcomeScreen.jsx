import React from 'react';
import './WelcomeScreen.css';

const SUGGESTIONS = [
  { title: 'Draft an email', subtitle: 'asking a client for project feedback' },
  { title: 'Explain a concept', subtitle: 'like quantum computing, simply' },
  { title: 'Generate an image', subtitle: 'of a cabin in a snowy forest' },
  { title: 'Plan my week', subtitle: 'around three big priorities' },
];

export default function WelcomeScreen({ onPick }) {
  return (
    <div className="welcome">
      <img src="/favicon.svg" alt="NovaScribe" className="welcome__mark" />
      <h1 className="welcome__title">What should we write today? ✍️</h1>
      <p className="welcome__subtitle">
        Ask anything, generate an image, or talk it out loud — NovaScribe is listening.
      </p>

      <div className="welcome__suggestions">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s.title}
            className="welcome__suggestion"
            style={{ animationDelay: `${260 + i * 70}ms` }}
            onClick={() => onPick(`${s.title} ${s.subtitle}`)}
          >
            <span className="welcome__suggestion-title">{s.title}</span>
            <span className="welcome__suggestion-subtitle">{s.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
