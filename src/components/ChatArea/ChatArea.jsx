import React, { useEffect, useRef, useState, useCallback } from 'react';
import Message from './Message.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import WelcomeScreen from './WelcomeScreen.jsx';
import InputBar from '../InputBar/InputBar.jsx';
import MediaOverlay from '../MediaOverlay/MediaOverlay.jsx';
import { MenuIcon } from '../common/Icons.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import { useChatSocket } from '../../hooks/useChatSocket.js';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js';
import * as api from '../../services/api.js';
import './ChatArea.css';

export default function ChatArea() {
  const {
    userId,
    activeChatId,
    setActiveChatId,
    chats,
    setChats,
    refreshChats,
    refreshCreations,
    setLimitModal,
    setSidebarOpen,
    checkGuestAllowance,
  } = useAppContext();

  const [capturedAttachment, setCapturedAttachment] = useState(null);
  const [overlayMode, setOverlayMode] = useState(null);
  const [liveChatStatus, setLiveChatStatus] = useState('listening');
  const [liveChatReplyText, setLiveChatReplyText] = useState('');
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const scrollRef = useRef(null);
  const pendingPromptRef = useRef('');
  const isLiveChatActiveRef = useRef(false);
  const tts = useSpeechSynthesis();

  const handleLimitReached = useCallback((payload) => setLimitModal(payload), [setLimitModal]);

  const handleChatCreated = useCallback(
    (newChatId) => {
      if (!activeChatId && newChatId) {
        setActiveChatId(newChatId);
        refreshChats();
      }
    },
    [activeChatId, setActiveChatId, refreshChats]
  );

  const handleAssistantDone = useCallback(
    (message) => {
      if (!isLiveChatActiveRef.current) return;
      if (message.type !== 'text' || !message.content) {
        setLiveChatStatus('listening');
        return;
      }
      setLiveChatStatus('speaking');
      setLiveChatReplyText(message.content);

      if (!tts.isSupported) {
        setLiveChatStatus('listening');
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = message.content.replace(/#{1,6}\s?/g, '').replace(/\*\*?(.*?)\*\*?/g, '$1');
      const utterance = new window.SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      let resumed = false;
      const resumeListening = () => {
        if (resumed) return;
        resumed = true;
        if (isLiveChatActiveRef.current) setLiveChatStatus('listening');
      };

      utterance.onend = resumeListening;
      utterance.onerror = resumeListening;

      const estimatedMs = Math.max(4000, message.content.length * 90);
      setTimeout(resumeListening, estimatedMs);

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error('[NovaScribe] speechSynthesis.speak failed:', err);
          resumeListening();
        }
      }, 60);
    },
    [tts.isSupported]
  );

  const { messages, setMessages, sendMessage, stopGeneration, isStreaming } = useChatSocket({
    chatId: activeChatId,
    userId,
    onChatCreated: handleChatCreated,
    onLimitReached: handleLimitReached,
    onAssistantDone: handleAssistantDone,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      if (!activeChatId) {
        setHistoryMessages([]);
        setMessages([]);
        return;
      }
      setLoadingHistory(true);
      try {
        const data = await api.fetchChatMessages(activeChatId);
        if (active) {
          setHistoryMessages(data.messages || []);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        if (active) setLoadingHistory(false);
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  useEffect(() => {
    if (!isStreaming) refreshChats();
  }, [isStreaming, refreshChats]);

  const allMessages = [...historyMessages, ...messages];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages.length, messages]);

  const handleSendText = (text) => {
    if (checkGuestAllowance && !checkGuestAllowance()) return;
    const attachments = capturedAttachment ? [capturedAttachment] : [];
    const finalText = text?.trim() || (attachments.length > 0 ? 'What is in this image?' : '');
    sendMessage(finalText, attachments);
    setCapturedAttachment(null);
  };

  const handleGenerateImage = async (prompt) => {
    if (!prompt) return;
    if (checkGuestAllowance && !checkGuestAllowance()) return;
    setIsImageGenerating(true);
    try {
      const result = await api.generateImage(prompt, activeChatId);
      if (result.message) {
        setHistoryMessages((prev) => [...prev, result.message]);
      }
      if (!activeChatId && result.chatId) {
        setActiveChatId(result.chatId);
      }
      await refreshChats();
      refreshCreations();
    } catch (err) {
      if (err.status === 429 && err.payload) {
        setLimitModal(err.payload);
      } else {
        setHistoryMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'assistant', type: 'error', content: err.message },
        ]);
      }
    } finally {
      setIsImageGenerating(false);
    }
  };

  const handleFileSelected = async (file) => {
    try {
      const result = await api.uploadFile(file);
      setCapturedAttachment(result.file);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleVoiceResult = (text) => {
    pendingPromptRef.current = text;
    handleSendText(text);
  };

  const handlePhotoCapture = (dataUrl) => {
    const base64 = dataUrl.split(',')[1] || null;
    setCapturedAttachment({ url: dataUrl, originalName: 'Camera photo', mimeType: 'image/png', base64 });
  };

  const handleSuggestionPick = (text) => handleSendText(text);

  const handleLiveChatUtterance = (text) => {
    if (checkGuestAllowance && !checkGuestAllowance()) return;
    setLiveChatStatus('thinking');
    sendMessage(text);
  };

  const handleOpenLiveChat = () => {
    isLiveChatActiveRef.current = true;
    setLiveChatStatus('listening');
    setLiveChatReplyText('');
    setOverlayMode('livechat');
  };

  const handleCloseLiveChat = () => {
    isLiveChatActiveRef.current = false;
    window.speechSynthesis?.cancel();
    setOverlayMode(null);
  };

  return (
    <main className="chat-area">
      <div className="chat-area__topbar">
        <button
          className="chat-area__mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          title="Open menu"
        >
          <MenuIcon size={18} />
        </button>
        <h2 className="chat-area__chat-title">
          {chats.find((c) => c.id === activeChatId)?.title || 'New Chat'}
        </h2>
      </div>

      <div className="chat-area__scroll" ref={scrollRef}>
        {!activeChatId && allMessages.length === 0 ? (
          <WelcomeScreen onPick={handleSuggestionPick} />
        ) : (
          <div className="chat-area__messages">
            {loadingHistory && <p className="chat-area__loading-hint">Loading conversation…</p>}
            {allMessages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {isStreaming && !messages.some((m) => m.streaming) && <TypingIndicator />}
          </div>
        )}
      </div>

      <InputBar
        onSendText={handleSendText}
        onGenerateImage={handleGenerateImage}
        onOpenCamera={() => setOverlayMode('camera')}
        onOpenVoice={() => setOverlayMode('voice')}
        onOpenLiveChat={handleOpenLiveChat}
        onFileSelected={handleFileSelected}
        isStreaming={isStreaming}
        onStop={stopGeneration}
        isImageGenerating={isImageGenerating}
        attachment={capturedAttachment}
        onRemoveAttachment={() => setCapturedAttachment(null)}
      />

      {overlayMode && (
        <MediaOverlay
          mode={overlayMode}
          onClose={overlayMode === 'livechat' ? handleCloseLiveChat : () => setOverlayMode(null)}
          onVoiceResult={handleVoiceResult}
          onPhotoCapture={handlePhotoCapture}
          onLiveChatUtterance={handleLiveChatUtterance}
          liveChatStatus={liveChatStatus}
          liveChatReplyText={liveChatReplyText}
        />
      )}
    </main>
  );
}
