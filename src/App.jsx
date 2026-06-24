import React from 'react';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import ChatArea from './components/ChatArea/ChatArea.jsx';
import LimitModal from './components/Modals/LimitModal.jsx';
import { useAppContext } from './context/AppContext.jsx';
import './styles/App.css';

export default function App() {
  const { limitModal, setLimitModal } = useAppContext();

  return (
    <div className="app-shell">
      <Sidebar />
      <ChatArea />

      {limitModal && (
        <LimitModal payload={limitModal} onClose={() => setLimitModal(null)} />
      )}
    </div>
  );
}
