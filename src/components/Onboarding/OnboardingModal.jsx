import React, { useState } from 'react';
import { MicIcon, GalleryIcon, ChatBubbleIcon } from '../common/Icons.jsx';
import './OnboardingModal.css';

const SLIDES = [
  {
    icon: ChatBubbleIcon,
    title: 'Welcome to NovaScribe.AI',
    text: 'Your all-in-one AI assistant for chat, images, and voice conversations.',
  },
  {
    icon: MicIcon,
    title: 'Talk naturally',
    text: 'Use Live Chat to speak with NovaScribe out loud. We may ask for microphone access.',
  },
  {
    icon: GalleryIcon,
    title: 'Share photos & files',
    text: 'Attach images or documents anytime — we may ask for gallery/camera access when you do.',
  },
];

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const Icon = slide.icon;

  const next = () => {
    if (step < SLIDES.length - 1) setStep(step + 1);
    else {
      localStorage.setItem('novascribe_onboarded', '1');
      onClose();
    }
  };

  const skip = () => {
    localStorage.setItem('novascribe_onboarded', '1');
    onClose();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-icon">
          <Icon size={32} />
        </div>
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={i === step ? 'active' : ''} />
          ))}
        </div>
        <div className="onboarding-actions">
          <button className="onboarding-skip" onClick={skip}>Skip</button>
          <button className="onboarding-next" onClick={next}>
            {step === SLIDES.length - 1 ? "Let's go" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
