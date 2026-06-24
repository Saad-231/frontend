/**
 * Generates (or retrieves) a stable per-browser user id.
 * Stands in for real authentication in this demo — swap for
 * a JWT/session-derived id when you add a login flow.
 */
export function getOrCreateUserId() {
  const KEY = 'novascribe_user_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
