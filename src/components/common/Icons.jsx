import React from 'react';

/* A small, dependency-free icon set. Each icon accepts standard SVG props
   (size via `size`, color inherits via `currentColor`) so we avoid pulling
   in an icon library just for a handful of glyphs. */

const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const MenuIcon = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const SearchIcon = ({ size = 18, ...p }) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const PlusIcon = ({ size = 18, ...p }) => (
  <svg {...base(size)} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const SparkleStackIcon = ({ size = 18, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3l1.6 4.2L18 9l-4.4 1.8L12 15l-1.6-4.2L6 9l4.4-1.8L12 3z" />
    <path d="M5 16.5l.7 1.8L7.5 19l-1.8.7L5 21.5l-.7-1.8L2.5 19l1.8-.7L5 16.5z" />
  </svg>
);

export const ChatBubbleIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const TrashIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const CollapseIcon = ({ size = 18, ...p }) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="9" y1="4" x2="9" y2="20" />
  </svg>
);

export const ImageIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

export const PaperclipIcon = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a1.5 1.5 0 0 1-2.12-2.12l8.49-8.48" />
  </svg>
);

export const GalleryIcon = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="M21 15l-4.5-4.5a2 2 0 0 0-2.8 0L8 16" />
  </svg>
);

export const CameraIcon = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M4 8h2.5l1.4-2h8.2l1.4 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
    <circle cx="12" cy="14" r="3.5" />
  </svg>
);

export const MicIcon = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

export const SendIcon = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const StopIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p} fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export const MuteIcon = ({ size = 22, ...p }) => (
  <svg {...base(size)} {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

export const CloseIcon = ({ size = 22, ...p }) => (
  <svg {...base(size)} {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const LinkIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
    <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
  </svg>
);

export const ClockIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
);

export const AlertIcon = ({ size = 28, ...p }) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const CheckIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const DownloadIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3v12" />
    <polyline points="7 10 12 15 17 10" />
    <path d="M5 21h14" />
  </svg>
);

export const CaptionIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="6" y1="14" x2="10" y2="14" />
    <line x1="13" y1="14" x2="18" y2="14" />
    <line x1="6" y1="10" x2="14" y2="10" />
  </svg>
);

export const SpeakerIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <polygon points="4 9 9 9 13 5 13 19 9 15 4 15 4 9" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 6a8 8 0 0 1 0 12" />
  </svg>
);

export const SpeakerOffIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <polygon points="4 9 9 9 13 5 13 19 9 15 4 15 4 9" />
    <line x1="17" y1="9" x2="23" y2="15" />
    <line x1="23" y1="9" x2="17" y2="15" />
  </svg>
);

export const LiveChatIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="8" y1="10" x2="8" y2="12" />
    <line x1="12" y1="8" x2="12" y2="14" />
    <line x1="16" y1="9" x2="16" y2="13" />
  </svg>
);

export const UserIcon = ({ size = 18, ...p }) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </svg>
);
export const CopyIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const ThumbsUpIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

export const ThumbsDownIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z" />
    <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
  </svg>
);

export const RegenerateIcon = ({ size = 16, ...p }) => (
  <svg {...base(size)} {...p}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
