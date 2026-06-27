import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getOrCreateUserId } from '../utils/userId';
import * as api from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userId] = useState(getOrCreateUserId);

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [creations, setCreations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > 768;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [limitModal, setLimitModal] = useState(null);

  const refreshChats = useCallback(async () => {
    try {
      const data = await api.fetchChats();
      setChats(data.chats || []);
    } catch (err) {
      console.error('Failed to load chats', err);
    }
  }, []);

  const refreshCreations = useCallback(async () => {
    try {
      const data = await api.fetchCreations();
      setCreations(data.creations || []);
    } catch (err) {
      console.error('Failed to load creations', err);
    }
  }, []);

  useEffect(() => {
    refreshChats();
    refreshCreations();
  }, [refreshChats, refreshCreations]);

  const startNewChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const value = {
    userId,
    chats,
    setChats,
    refreshChats,
    activeChatId,
    setActiveChatId,
    creations,
    refreshCreations,
    sidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    limitModal,
    setLimitModal,
    startNewChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
