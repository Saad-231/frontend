import React, { useMemo, useState, useEffect } from 'react';
import {
  MenuIcon,
  SearchIcon,
  PlusIcon,
  SparkleStackIcon,
  ChatBubbleIcon,
  TrashIcon,
  ImageIcon,
  DownloadIcon,
} from '../common/Icons.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import * as api from '../../services/api.js';
import './Sidebar.css';

function groupChatsByDate(chats) {
  const groups = { Today: [], Yesterday: [], 'Previous 7 Days': [], Older: [] };
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  const safeChats = chats || [];
  safeChats.forEach((chat) => {
    if (!chat || !chat.updatedAt) return;
    const updated = new Date(chat.updatedAt);
    const diffDays = Math.floor((now - updated) / oneDay);

    if (diffDays <= 0) groups.Today.push(chat);
    else if (diffDays === 1) groups.Yesterday.push(chat);
    else if (diffDays <= 7) groups['Previous 7 Days'].push(chat);
    else groups.Older.push(chat);
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export default function Sidebar() {
  const context = useAppContext();
  const sidebarOpen = context?.sidebarOpen;
  const setSidebarOpen = context?.setSidebarOpen;
  const activeChatId = context?.activeChatId;
  const setActiveChatId = context?.setActiveChatId;
  const creations = context?.creations || [];
  const searchQuery = context?.searchQuery || '';
  const setSearchQuery = context?.setSearchQuery;
  const startNewChat = context?.startNewChat;

  const [localChats, setLocalChats] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [myStuffExpanded, setMyStuffExpanded] = useState(false);

  // بالکل صاف اور سیکیور ٹوکن بیسڈ فیچ لاجک (بریکٹ فکسڈ)
  useEffect(() => {
    async function loadSecureHistory() {
      try {
        const token = localStorage.getItem('token') || '';
        const response = await fetch("https://backend-ivory-nine-55.vercel.app/api/history/chats", {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            setLocalChats(data);
            if (context?.setChats) context.setChats(data);
          }
        }
      } catch (err) {
        console.error("Secure history load failed:", err);
      }
    }

    loadSecureHistory();
  }, []); // यहाँ स्क्रिप्ट टैग हटा कर ब्रैकेट बिल्कुल परफेक्ट क्लोज कर दिया है

  useEffect(() => {
    if (context?.chats && context.chats.length !== localChats.length) {
      setLocalChats(context.chats);
    }
  }, [context?.chats, localChats.length]);

  const filteredChats = useMemo(() => {
    const safeChats = localChats || [];
    if (!searchQuery.trim()) return safeChats;
    const q = searchQuery.toLowerCase();
    return safeChats.filter((c) => c && c.title && c.title.toLowerCase().includes(q));
  }, [localChats, searchQuery]);

  const groupedChats = useMemo(() => groupChatsByDate(filteredChats), [filteredChats]);

  const handleToggleSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen((open) => !open);
      if (!sidebarOpen) setShowSearch(false);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await api.deleteChatSession(chatId);
      setLocalChats((prev) => prev.filter((c) => c.id !== chatId));
      if (context?.setChats) context.setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId && startNewChat) startNewChat();
    } catch (err) {
      console.error('Failed to delete chat', err);
    }
  };

  const handleDownloadImage = (e, item) => {
    e.stopPropagation(); 
    const link = document.createElement('a');
    link.href = item.url;
    const safeName = (item.prompt || 'novascribe-image').slice(0, 60).replace(/[^a-z0-9]+/gi, '-');
    link.download = `${safeName || 'novascribe-image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!sidebarOpen) {
    return (
      <aside className="sidebar sidebar--collapsed">
        <button className="sidebar__icon-btn" onClick={handleToggleSidebar} title="Open menu" aria-label="Open menu">
          <MenuIcon />
        </button>
        <button className="sidebar__icon-btn" onClick={startNewChat} title="New chat" aria-label="New chat">
          <PlusIcon />
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <button
          className="sidebar__icon-btn"
          onClick={handleToggleSidebar}
          title="Collapse menu"
          aria-label="Collapse menu"
        >
          <MenuIcon />
        </button>
        <div className="sidebar__brand">
          <img src="/favicon.svg" alt="NovaScribe" className="sidebar__brand-mark" />
          <span className="sidebar__brand-name">NovaScribe</span>
        </div>
      </div>

      <div className={`sidebar__search ${showSearch ? 'sidebar__search--active' : ''}`}>
        <SearchIcon size={16} className="sidebar__search-icon" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onFocus={() => setShowSearch(true)}
          onChange={(e) => setSearchQuery ? setSearchQuery(e.target.value) : null}
          className="sidebar__search-input"
        />
      </div>

      <button className="sidebar__new-chat" onClick={startNewChat}>
        <PlusIcon size={16} />
        <span>New Chat</span>
      </button>

      <div className="sidebar__section">
        <button
          className="sidebar__section-header"
          onClick={() => setMyStuffExpanded((v) => !v)}
        >
          <SparkleStackIcon size={16} />
          <span>My Stuff</span>
          <span className="sidebar__count">{(creations || []).length}</span>
        </button>

        {myStuffExpanded && (
          <div className="sidebar__my-stuff-grid">
            {(!creations || creations.length === 0) && (
              <p className="sidebar__empty-hint">Images you generate will appear here.</p>
            )}
            {creations && creations.map((item) => (
              <div
                key={item.id}
                className="sidebar__creation-thumb"
                title={item.prompt}
                onClick={() => item.chatId && setActiveChatId && setActiveChatId(item.chatId)}
                role={item.chatId ? 'button' : undefined}
                tabIndex={item.chatId ? 0 : undefined}
              >
                <img src={item.url} alt={item.prompt} loading="lazy" />
                <button
                  className="sidebar__creation-download"
                  onClick={(e) => handleDownloadImage(e, item)}
                  aria-label="Download image"
                  title="Download image"
                >
                  <DownloadIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar__divider" />

      <div className="sidebar__history">
        <p className="sidebar__history-label">Chats</p>
        {groupedChats.length === 0 && (
          <p className="sidebar__empty-hint">No conversations yet — start one!</p>
        )}
        {groupedChats.map(([label, items]) => (
          <div key={label} className="sidebar__history-group">
            <p className="sidebar__history-group-label">{label}</p>
            {items.map((chat) => (
              <button
                key={chat.id}
                className={`sidebar__history-item ${
                  chat.id === activeChatId ? 'sidebar__history-item--active' : ''
                }`}
                onClick={() => setActiveChatId ? setActiveChatId(chat.id) : null}
              >
                <ChatBubbleIcon size={15} className="sidebar__history-item-icon" />
                <span className="sidebar__history-item-title">{chat.title}</span>
                <span
                  className="sidebar__history-item-delete"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  role="button"
                  tabIndex={-1}
                  aria-label="Delete chat"
                >
                  <TrashIcon size={14} />
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            <ImageIcon size={14} />
          </div>
          <span>Your workspace</span>
        </div>
      </div>
    </aside>
  );
}
