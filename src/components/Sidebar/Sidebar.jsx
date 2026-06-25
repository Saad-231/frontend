import React, { useMemo, useState, useEffect } from 'react'; // यहाँ useEffect ऐड कर दिया है
import axios from 'axios'; // ڈائریکٹ ہٹ مارنے کے لیے ایکسیوس امپورٹ کیا
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

  chats.forEach((chat) => {
    if (!chat || !chat.updatedAt) return; // پروٹیکشن ایڈ کی تاکہ ان ڈیفائنڈ ڈیٹ کریش نہ کرے
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
  const {
    sidebarOpen,
    setSidebarOpen,
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    creations,
    setCreations, // کانٹیکسٹ سے اس کو نکالا تاکہ امیجز بھی اپڈیٹ ہوں
    searchQuery,
    setSearchQuery,
    startNewChat,
  } = useAppContext();

  const [showSearch, setShowSearch] = useState(false);
  const [myStuffExpanded, setMyStuffExpanded] = useState(false);

  // ==========================================================================
  // یہ رہا وہ جادوئی کوڈ جو لائیو سائٹ پر بنا ساکٹ کے ڈیٹا کھینچ کر لائے گا
  // ==========================================================================
  useEffect(() => {
    // 1. چیٹس لوڈ کرنے کے لیے ڈائریکٹ لائیو ہٹ
    axios.get("https://backend-ivory-nine-55.vercel.app/api/history/chats")
      .then(res => {
        if (res.data) setChats(res.data);
      })
      .catch(err => console.error("Live chats fetch error:", err));

    // 2. مائی اسٹف کی امیجز لوڈ کرنے کے لیے ڈائریکٹ لائیو ہٹ
    axios.get("https://backend-ivory-nine-55.vercel.app/api/history/creations")
      .then(res => {
        if (res.data && setCreations) setCreations(res.data);
      })
      .catch(err => console.error("Live creations fetch error:", err));
  }, []); // یہ بریکٹ لازمی ہیں تاکہ پیج لوڈ ہوتے ہی صرف ایک بار چلے
  // ==========================================================================

  const filteredChats = useMemo(() => {
    const safeChats = chats || []; // سیفٹی چیک
    if (!searchQuery.trim()) return safeChats;
    const q = searchQuery.toLowerCase();
    return safeChats.filter((c) => c && c.title && c.title.toLowerCase().includes(q));
  }, [chats, searchQuery]);

  const groupedChats = useMemo(() => groupChatsByDate(filteredChats), [filteredChats]);

  const handleToggleSidebar = () => {
    setSidebarOpen((open) => !open);
    if (!sidebarOpen) setShowSearch(false);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await api.deleteChatSession(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) startNewChat();
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
          onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => item.chatId && setActiveChatId(item.chatId)}
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
                onClick={() => setActiveChatId(chat.id)}
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
  
