import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getCodeforcesStats } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './CodeforcesDashboard.css';

const CYAN = '#06b6d4';
const VIOLET = '#7c3aed';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass">
      <div className="tooltip-label">{label}</div>
      <div className="tooltip-val">{payload[0].value} problems</div>
    </div>
  );
}

function TagTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass">
      <div className="tooltip-label">{label}</div>
      <div className="tooltip-val">{payload[0].value} solved</div>
    </div>
  );
}

export default function CodeforcesDashboard() {
  const [handle, setHandle] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const result = await getCodeforcesStats(handle.trim());
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Build chart data
  const diffChartData = data
    ? Object.entries(data.difficulty)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([rating, count]) => ({ rating, count }))
    : [];

  const allTagData = data
    ? Object.entries(data.tags)
        .sort(([, a], [, b]) => b - a)
    : [];

  const tagChartData = allTagData
    .filter(([tag]) => tag.toLowerCase().includes(tagFilter.toLowerCase()))
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));

  const topTag = allTagData[0]?.[0] ?? '—';
  const maxRating = data
    ? Object.entries(data.difficulty).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—'
    : '—';

  return (
    <div className="cf-page page">
      <div className="container">
        {/* ── Header ── */}
        <div className="cf-header animate-slide-up">
          <div>
            <h1 className="cf-title">
              <span className="cf-accent">⚡</span> Codeforces Dashboard
            </h1>
            <p className="cf-subtitle">Enter a Codeforces handle to load stats</p>
          </div>
        </div>

        {/* ── Search ── */}
        <form id="cf-search-form" className="cf-search glass animate-slide-up" onSubmit={handleSearch}>
          <input
            id="cf-handle-input"
            className="form-input cf-search-input"
            placeholder="e.g. tourist, jiangly, Petr..."
            value={handle}
            onChange={e => setHandle(e.target.value)}
          />
          <button id="cf-search-btn" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Fetching…' : 'Fetch Stats'}
          </button>
        </form>

        {error && (
          <div className="cf-error animate-fade-in" role="alert">⚠ {error}</div>
        )}

        {loading && <LoadingSpinner text="Fetching from Codeforces…" />}

        {data && !loading && (
          <div className="animate-fade-in">
            {/* ── Stat Cards ── */}
            <h2 className="section-title">Overview</h2>
            <div className="grid-3" style={{ marginBottom: 32 }}>
              <div className="stat-card glass">
                <div className="stat-card-icon" style={{ background: 'rgba(6,182,212,0.15)' }}>⚡</div>
                <div className="stat-card-value" style={{ color: CYAN }}>{data.totalSolved}</div>
                <div className="stat-card-label">Total Problems Solved</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-card-icon" style={{ background: 'rgba(124,58,237,0.15)' }}>🏷</div>
                <div className="stat-card-value" style={{ color: VIOLET, fontSize: '1.4rem', wordBreak: 'break-all' }}>
                  {topTag}
                </div>
                <div className="stat-card-label">Most Common Tag</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🔥</div>
                <div className="stat-card-value" style={{ color: '#f59e0b' }}>{maxRating}</div>
                <div className="stat-card-label">Most Attempted Rating</div>
              </div>
            </div>

            {/* ── Difficulty Chart ── */}
            {diffChartData.length > 0 && (
              <>
                <h2 className="section-title">Rating Distribution</h2>
                <div className="glass cf-chart-card" style={{ marginBottom: 32 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={diffChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis
                        dataKey="rating"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.07)' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {diffChartData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={`hsl(${260 + i * 8}, 70%, ${50 + i * 2}%)`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* ── Tag Chart ── */}
            {allTagData.length > 0 && (
              <>
                <div className="cf-tags-header">
                  <h2 className="section-title" style={{ flex: 1, marginBottom: 0 }}>Tag Analysis</h2>
                  <input
                    id="cf-tag-filter"
                    className="form-input cf-tag-filter"
                    placeholder="Filter tags…"
                    value={tagFilter}
                    onChange={e => setTagFilter(e.target.value)}
                  />
                </div>
                <div className="glass cf-chart-card" style={{ marginBottom: 32 }}>
                  {tagChartData.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">🏷</div>
                      <h3>No matching tags</h3>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={Math.max(250, tagChartData.length * 32)}>
                      <BarChart
                        layout="vertical"
                        data={tagChartData}
                        margin={{ top: 0, right: 20, left: 100, bottom: 0 }}
                      >
                        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          type="category"
                          dataKey="tag"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          width={95}
                        />
                        <Tooltip content={<TagTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="count" fill={CYAN} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
