import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getLeetCodeStats, searchLeetCodeQuestion } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './LeetCodeDashboard.css';

const DIFF_COLORS = {
  Easy:   '#10b981',
  Medium: '#f59e0b',
  Hard:   '#ef4444',
};

function DiffTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="chart-tooltip glass">
      <div className="tooltip-label">{name}</div>
      <div className="tooltip-val">{value} solved</div>
    </div>
  );
}

function DiffBadge({ diff }) {
  const cls = diff === 'Easy' ? 'badge-easy' : diff === 'Medium' ? 'badge-medium' : 'badge-hard';
  return <span className={`badge ${cls}`}>{diff}</span>;
}

export default function LeetCodeDashboard() {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [qResult, setQResult] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState('');

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const result = await getLeetCodeStats(username.trim());
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setQLoading(true);
    setQError('');
    setQResult(null);
    try {
      const result = await searchLeetCodeQuestion(query.trim());
      setQResult(result);
    } catch (err) {
      setQError(err.message);
    } finally {
      setQLoading(false);
    }
  };

  const pieData = data
    ? ['Easy', 'Medium', 'Hard'].map(k => ({ name: k, value: data[k.toLowerCase()] || 0 }))
    : [];

  const pct = (val) => data?.totalSolved ? Math.round((val / data.totalSolved) * 100) : 0;

  return (
    <div className="lc-page page">
      <div className="container">
        {/* ── Header ── */}
        <div className="lc-header animate-slide-up">
          <h1 className="lc-title"><span>🧩</span> LeetCode Dashboard</h1>
          <p className="lc-subtitle">Enter a LeetCode username to load your stats</p>
        </div>

        {/* ── User search ── */}
        <form id="lc-search-form" className="lc-search glass animate-slide-up" onSubmit={handleFetch}>
          <input
            id="lc-username-input"
            className="form-input lc-search-input"
            placeholder="e.g. neal_wu, lee215, jiangly..."
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button id="lc-fetch-btn" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Fetching…' : 'Fetch Stats'}
          </button>
        </form>

        {error && <div className="lc-error animate-fade-in" role="alert">⚠ {error}</div>}
        {loading && <LoadingSpinner text="Fetching from LeetCode…" />}

        {data && !loading && (
          <div className="animate-fade-in">
            {/* ── Stat cards ── */}
            <h2 className="section-title">Overview</h2>
            <div className="grid-4" style={{ marginBottom: 32 }}>
              <div className="stat-card glass">
                <div className="stat-card-icon" style={{ background: 'rgba(124,58,237,0.15)' }}>🏆</div>
                <div className="stat-card-value" style={{ color: '#9f67ff' }}>{data.totalSolved}</div>
                <div className="stat-card-label">Total Solved</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>🟢</div>
                <div className="stat-card-value" style={{ color: '#10b981' }}>{data.easy}</div>
                <div className="stat-card-label">Easy</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🟡</div>
                <div className="stat-card-value" style={{ color: '#f59e0b' }}>{data.medium}</div>
                <div className="stat-card-label">Medium</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>🔴</div>
                <div className="stat-card-value" style={{ color: '#ef4444' }}>{data.hard}</div>
                <div className="stat-card-label">Hard</div>
              </div>
            </div>

            {/* ── Pie Chart ── */}
            <h2 className="section-title">Difficulty Breakdown</h2>
            <div className="lc-chart-row">
              <div className="glass lc-chart-card">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={DIFF_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip content={<DiffTooltip />} />
                    <Legend
                      formatter={(val) => <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lc-diff-bars glass">
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <div key={d} className="lc-diff-row">
                    <div className="lc-diff-label">
                      <DiffBadge diff={d} />
                      <span className="lc-diff-count">{data[d.toLowerCase()]}</span>
                    </div>
                    <div className="lc-progress-track">
                      <div
                        className="lc-progress-fill"
                        style={{
                          width: `${pct(data[d.toLowerCase()])}%`,
                          background: DIFF_COLORS[d],
                        }}
                      />
                    </div>
                    <span className="lc-pct">{pct(data[d.toLowerCase()])}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Question Lookup ── */}
        <div style={{ marginTop: 40 }}>
          <h2 className="section-title">Question Lookup</h2>
          <div className="glass lc-qlookup animate-fade-in">
            <p className="lc-qlookup-hint">Search by problem number (e.g. <code className="mono">1</code>) or title slug (e.g. <code className="mono">two-sum</code>)</p>
            <form id="lc-question-form" className="lc-qsearch" onSubmit={handleSearch}>
              <input
                id="lc-question-input"
                className="form-input"
                placeholder="Number or title..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button id="lc-question-btn" type="submit" className="btn btn-outline" disabled={qLoading}>
                {qLoading ? 'Searching…' : 'Search'}
              </button>
            </form>

            {qError && <div className="lc-error" role="alert">⚠ {qError}</div>}
            {qLoading && <LoadingSpinner text="Looking up…" />}

            {qResult && !qLoading && (
              <div className="lc-qresult glass-hover animate-fade-in">
                <div className="lc-qresult-top">
                  <h3 className="lc-qresult-title">{qResult.title}</h3>
                  <DiffBadge diff={qResult.difficulty} />
                </div>
                <a
                  href={qResult.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  id="lc-open-problem-link"
                >
                  Open on LeetCode ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
