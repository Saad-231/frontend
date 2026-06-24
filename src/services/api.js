import { getOrCreateUserId } from '../utils/userId';

const BASE = '/api';

function headers(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getOrCreateUserId(),
    ...extra,
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || 'Request failed');
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function fetchChats() {
  const res = await fetch(`${BASE}/history/chats`, { headers: headers() });
  return handle(res);
}

export async function createChatSession(title) {
  const res = await fetch(`${BASE}/history/chats`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title }),
  });
  return handle(res);
}

export async function fetchChatMessages(chatId) {
  const res = await fetch(`${BASE}/history/chats/${chatId}/messages`, { headers: headers() });
  return handle(res);
}

export async function deleteChatSession(chatId) {
  const res = await fetch(`${BASE}/history/chats/${chatId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  return handle(res);
}

export async function fetchCreations() {
  const res = await fetch(`${BASE}/history/creations`, { headers: headers() });
  return handle(res);
}

export async function fetchLimitStatus() {
  const res = await fetch(`${BASE}/chat/limit-status`, { headers: headers() });
  return handle(res);
}

export async function generateImage(prompt, chatId) {
  const res = await fetch(`${BASE}/image/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, chatId }),
  });
  return handle(res);
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: { 'x-user-id': getOrCreateUserId() }, // no Content-Type — browser sets multipart boundary
    body: formData,
  });
  return handle(res);
}
