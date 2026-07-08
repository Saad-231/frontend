import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getOrCreateUserId } from '../utils/userId';
import * as api from '../services/api';

const AppContext = createContext(null);
const GUEST_LIMIT = 3;

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
  const [theme, setThemeState] = useState(() => localStorage.getItem('novascribe_theme') || 'dark');

  const setTheme = useCallback((t) => {
    localStorage.setItem('novascribe_theme', t);
    setThemeState(t);
  }, []);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('novascribe_user');
    return saved ? JSON.parse(saved) : null;
  });
  const isAuthenticated = Boolean(user);

  const [guestUsageCount, setGuestUsageCount] = useState(() => {
    return parseInt(localStorage.getItem('novascribe_guest_uses') || '0', 10);
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const login = useCallback((userData, token) => {
    localStorage.setItem('novascribe_user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setShowLoginPrompt(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('novascribe_user');
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const checkGuestAllowance = useCallback(() => {
    if (isAuthenticated) return true;
    if (guestUsageCount >= GUEST_LIMIT) {
      setShowLoginPrompt(true);
      return false;
    }
    const next = guestUsageCount + 1;
    setGuestUsageCount(next);
    localStorage.setItem('novascribe_guest_uses', String(next));
    return true;
  }, [isAuthenticated, guestUsageCount]);

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
    user,
    isAuthenticated,
    login,
    logout,
    guestUsageCount,
    checkGuestAllowance,
    showLoginPrompt,
    setShowLoginPrompt,
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
