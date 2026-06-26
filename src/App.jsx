import React from 'react';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import ChatArea from './components/ChatArea/ChatArea.jsx';
import LimitModal from './components/Modals/LimitModal.jsx';
import { useAppContext } from './context/AppContext.jsx';
import './styles/App.css';

export default function App() {
  const { limitModal, setLimitModal, sidebarOpen, setSidebarOpen } = useAppContext();

  return (
    <div className="app-shell">
      <Sidebar />

      {/* Mobile-only backdrop: tapping outside the open sidebar drawer
          closes it. Hidden on desktop via CSS (see App.css). */}
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
