import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import ChatArea from './components/ChatArea/ChatArea.jsx';
import LimitModal from './components/Modals/LimitModal.jsx';
import { useAppContext } from './context/AppContext.jsx';
import './styles/App.css';

export default function App() {
  const { limitModal, setLimitModal, sidebarOpen, setSidebarOpen } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <img src="/favicon.svg" alt="NovaScribe" className="app-loading__mark" />
        <p className="app-loading__text">NovaScribe.AI</p>
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--entering">
      <Sidebar />

      {sidebarOpen && (
        <div
          className="app-shell__mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <ChatArea />

      {limitModal && (
        <LimitModal payload={limitModal} onClose={() => setLimitModal(null)} />
      )}
    </div>
  );
}
