import React, { useEffect, useRef, useState, useCallback } from 'react';
import Message from './Message.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import WelcomeScreen from './WelcomeScreen.jsx';
import InputBar from '../InputBar/InputBar.jsx';
import MediaOverlay from '../MediaOverlay/MediaOverlay.jsx';
import { LiveChatIcon, MenuIcon } from '../common/Icons.jsx';
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
  } = useAppContext();

  const [capturedAttachment, setCapturedAttachment] = useState(null);
  const [overlayMode, setOverlayMode] = useState(null); // 'voice' | 'camera' | 'livechat' | null
  const [liveChatStatus, setLiveChatStatus] = useState('listening'); // 'listening' | 'thinking' | 'speaking'
  const [liveChatReplyText, setLiveChatReplyText] = useState('');
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const scrollRef = useRef(null);
  const pendingPromptRef = useRef('');
  const isLiveChatActiveRef = useRef(false);
  const tts = useSpeechSynthesis();

  const handleLimitReached = useCallback(
    (payload) => {
      setLimitModal(payload);
    },
    [setLimitModal]
  );

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

      // Chrome has long-standing bugs where speechSynthesis.speak() can
      // silently fail, or onend/onstart never fire (especially right
      // after cancel(), or with certain remote/cloud voices). We guard
      // against both: cancel first and wait a tick before speaking, and
      // set a fallback timer so the UI never gets stuck on "speaking"
      // forever even if the browser never fires onend.
      window.speechSynthesis.cancel();

      const utterance = new window.SpeechSynthesisUtterance(message.content);
      utterance.rate = 1;
      utterance.pitch = 1;

      let resumed = false;
      const resumeListening = () => {
        if (resumed) return;
        resumed = true;
        if (isLiveChatActiveRef.current) setLiveChatStatus('listening');
      };

      utterance.onend = resumeListening;
      utterance.onerror = resumeListening;

      // Fallback: estimate a generous speaking duration from text length
      // (~12 chars/sec is a safe lower bound for spoken English) plus a
      // buffer, in case the browser never fires onend at all.
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

  // Load history when switching chats
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

  // Refresh sidebar chat list whenever streaming finishes
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
    const attachments = capturedAttachment ? [capturedAttachment] : [];
    // If the user attached a photo/file but didn't type anything, still
    // send a minimal default message so the request goes through and
    // the AI has something to respond to alongside the image.
    const finalText = text?.trim() || (attachments.length > 0 ? 'What is in this image?' : '');
    sendMessage(finalText, attachments);
    setCapturedAttachment(null);
  };

  const handleGenerateImage = async (prompt) => {
    if (!prompt) return;
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
    sendMessage(text);
  };

  const handlePhotoCapture = (dataUrl) => {
    // dataUrl looks like "data:image/png;base64,AAAA..." — strip the
    // prefix so we store raw base64, matching the shape returned by
    // the file-upload endpoint (both feed the same AI vision path).
    const base64 = dataUrl.split(',')[1] || null;
    setCapturedAttachment({
      url: dataUrl,
      originalName: 'Camera photo',
      mimeType: 'image/png',
      base64,
    });
  };

  const handleSuggestionPick = (text) => {
    sendMessage(text);
  };

  const handleLiveChatUtterance = (text) => {
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
        <button
          className="chat-area__livechat-btn"
          onClick={handleOpenLiveChat}
          title="Start a live spoken conversation"
        >
          <LiveChatIcon size={15} />
          <span>Live chat</span>
        </button>
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
