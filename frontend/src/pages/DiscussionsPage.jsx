import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getDiscussions, getDiscussion, createDiscussion, addAnswer } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './DiscussionsPage.css';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PlatformBadge({ platform }) {
  return (
    <span className={`badge ${platform === 'Codeforces' ? 'badge-cf' : 'badge-lc'}`}>
      {platform === 'Codeforces' ? '⚡' : '🧩'} {platform}
    </span>
  );
}

/* ── New Discussion Modal ── */
function NewDiscussionModal({ onClose, onCreated, defaultAuthor }) {
  const [form, setForm] = useState({
    title: '', description: '', platform: 'Codeforces', problemLink: '', author: defaultAuthor || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.author) {
      setError('Title, description, and author are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await createDiscussion(form);
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal glass animate-slide-up">
        <div className="modal-header">
          <h2 className="modal-title">New Discussion</h2>
          <button id="modal-close-btn" className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="disc-error" role="alert">⚠ {error}</div>}

        <form id="new-discussion-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="disc-title">Title *</label>
            <input id="disc-title" className="form-input" placeholder="e.g. Approach for CF 1234A?" value={form.title} onChange={set('title')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="disc-desc">Description *</label>
            <textarea id="disc-desc" className="form-textarea" placeholder="Describe your question or insight…" value={form.description} onChange={set('description')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="disc-platform">Platform *</label>
            <select id="disc-platform" className="form-select" value={form.platform} onChange={set('platform')}>
              <option value="Codeforces">Codeforces</option>
              <option value="LeetCode">LeetCode</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="disc-link">Problem Link (optional)</label>
            <input id="disc-link" className="form-input" placeholder="https://..." value={form.problemLink} onChange={set('problemLink')} type="url" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="disc-author">Your Name *</label>
            <input id="disc-author" className="form-input" placeholder="Username" value={form.author} onChange={set('author')} required />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="disc-submit-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting…' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Discussion Detail Panel ── */
function DiscussionDetail({ id, currentUser }) {
  const [disc, setDisc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [answerAuthor, setAnswerAuthor] = useState(currentUser || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getDiscussion(id);
      setDisc(d);
    } catch {
      setDisc(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || !answerAuthor.trim()) {
      setError('Text and author are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const updated = await addAnswer(id, { text: answerText.trim(), author: answerAuthor.trim() });
      setDisc(updated);
      setAnswerText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading discussion…" />;
  if (!disc) return <div className="empty-state"><div className="empty-state-icon">💬</div><h3>Discussion not found</h3></div>;

  return (
    <div className="disc-detail animate-fade-in">
      <div className="disc-detail-header">
        <PlatformBadge platform={disc.platform} />
        <h2 className="disc-detail-title">{disc.title}</h2>
        <div className="disc-detail-meta">
          <span>By <strong>{disc.author}</strong></span>
          <span>·</span>
          <span>{formatDate(disc.createdAt)}</span>
          {disc.problemLink && (
            <>
              <span>·</span>
              <a href={disc.problemLink} target="_blank" rel="noopener noreferrer" className="disc-link">
                Problem ↗
              </a>
            </>
          )}
        </div>
      </div>
      <div className="disc-detail-desc glass">{disc.description}</div>

      {/* Answers */}
      <div className="disc-answers-section">
        <h3 className="disc-answers-title">
          {disc.answers.length} {disc.answers.length === 1 ? 'Answer' : 'Answers'}
        </h3>
        {disc.answers.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <div className="empty-state-icon">💭</div>
            <h3>No answers yet</h3>
            <p>Be the first to respond!</p>
          </div>
        ) : (
          <div className="disc-answers-list">
            {disc.answers.map((a, i) => (
              <div key={i} className="disc-answer glass">
                <div className="disc-answer-header">
                  <div className="disc-answer-avatar">{a.author[0].toUpperCase()}</div>
                  <div>
                    <div className="disc-answer-author">{a.author}</div>
                    <div className="disc-answer-date">{formatDate(a.createdAt)}</div>
                  </div>
                </div>
                <p className="disc-answer-text">{a.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add answer */}
      <div className="disc-add-answer glass">
        <h4 className="disc-add-title">Add Your Answer</h4>
        {error && <div className="disc-error">⚠ {error}</div>}
        <form id="add-answer-form" onSubmit={handleAnswer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="answer-author">Your Name</label>
            <input id="answer-author" className="form-input" value={answerAuthor} onChange={e => setAnswerAuthor(e.target.value)} placeholder="Username" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="answer-text">Answer</label>
            <textarea id="answer-text" className="form-textarea" value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Write your answer…" required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button id="answer-submit-btn" type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Answer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function DiscussionsPage() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('All');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getDiscussions();
      setDiscussions(d);
      if (d.length > 0 && !selectedId) setSelectedId(d[0]._id);
    } catch {
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleCreated = (disc) => {
    setDiscussions(prev => [disc, ...prev]);
    setSelectedId(disc._id);
    setShowModal(false);
  };

  const filtered = filterPlatform === 'All'
    ? discussions
    : discussions.filter(d => d.platform === filterPlatform);

  return (
    <div className="disc-page page">
      <div className="container">
        <div className="disc-top animate-slide-up">
          <div>
            <h1 className="disc-page-title">💬 Discussions</h1>
            <p className="disc-page-sub">Ask questions, share approaches, help others.</p>
          </div>
          <button id="new-discussion-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Discussion
          </button>
        </div>

        <div className="disc-layout">
          {/* ── List ── */}
          <aside className="disc-list-panel">
            <div className="disc-filter-row">
              {['All', 'Codeforces', 'LeetCode'].map(p => (
                <button
                  key={p}
                  id={`filter-${p.toLowerCase()}`}
                  className={`disc-filter-btn ${filterPlatform === p ? 'active' : ''}`}
                  onClick={() => setFilterPlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            {loading ? (
              <LoadingSpinner text="Loading discussions…" />
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <h3>No discussions</h3>
                <p>Be the first to post!</p>
              </div>
            ) : (
              <div className="disc-list">
                {filtered.map(d => (
                  <button
                    key={d._id}
                    id={`disc-item-${d._id}`}
                    className={`disc-list-item glass-hover ${selectedId === d._id ? 'active' : ''}`}
                    onClick={() => setSelectedId(d._id)}
                  >
                    <div className="disc-item-top">
                      <PlatformBadge platform={d.platform} />
                      <span className="disc-item-date">{formatDate(d.createdAt)}</span>
                    </div>
                    <div className="disc-item-title">{d.title}</div>
                    <div className="disc-item-meta">
                      <span>By {d.author}</span>
                      <span className="disc-item-answers">
                        💬 {d.answers?.length ?? 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* ── Detail ── */}
          <main className="disc-detail-panel">
            {selectedId ? (
              <DiscussionDetail id={selectedId} currentUser={user?.username} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <h3>Select a discussion</h3>
                <p>Pick one from the list to read it.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {showModal && (
        <NewDiscussionModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
          defaultAuthor={user?.username || ''}
        />
      )}
    </div>
  );
}
