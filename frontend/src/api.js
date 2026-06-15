const BASE = 'http://localhost:5001';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth ─────────────────────────────────────────────
export const signup = (username, password) =>
  request('/auth/signup', { method: 'POST', body: JSON.stringify({ username, password }) });

export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

// ── Codeforces ───────────────────────────────────────
export const getCodeforcesStats = (handle) =>
  request(`/codeforces/${encodeURIComponent(handle)}`);

// ── LeetCode ─────────────────────────────────────────
export const getLeetCodeStats = (username) =>
  request(`/leetcode/${encodeURIComponent(username)}`);

export const searchLeetCodeQuestion = (query) =>
  request(`/leetcode/question/${encodeURIComponent(query)}`);

// ── Discussions ──────────────────────────────────────
export const getDiscussions = () => request('/discussions');

export const getDiscussion = (id) => request(`/discussions/${id}`);

export const createDiscussion = (body) =>
  request('/discussions', { method: 'POST', body: JSON.stringify(body) });

export const addAnswer = (id, body) =>
  request(`/discussions/${id}/answers`, { method: 'POST', body: JSON.stringify(body) });

// ── Code Execution ───────────────────────────────────────────
export const executeCode = (code, language = 'python', stdin = '') =>
  request('/api/execute', { method: 'POST', body: JSON.stringify({ code, language, stdin }) });

