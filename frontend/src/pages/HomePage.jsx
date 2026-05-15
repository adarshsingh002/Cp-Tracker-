import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './HomePage.css';

const PLATFORMS = [
  {
    id: 'codeforces',
    path: '/codeforces',
    name: 'Codeforces',
    tagline: 'Dive into your CF stats — solved problems, difficulty distribution, and tag breakdowns.',
    icon: '⚡',
    accent: 'cyan',
    stats: ['Rating Charts', 'Tag Analysis', 'Problem Counts'],
  },
  {
    id: 'leetcode',
    path: '/leetcode',
    name: 'LeetCode',
    tagline: 'Track Easy/Medium/Hard splits, search any problem by name or number.',
    icon: '🧩',
    accent: 'amber',
    stats: ['Difficulty Donut', 'Question Search', 'Progress Stats'],
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-page page">
      <div className="home-bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="container">
        {/* ── Hero ── */}
        <header className="home-hero animate-slide-up">
          <div className="home-welcome-chip">
            <span className="home-avatar">{user?.username[0].toUpperCase()}</span>
            <span>Welcome back, <strong>{user?.username}</strong></span>
          </div>
          <h1 className="home-title">
            Your CP Journey,<br />
            <span className="gradient-text">All in One Place.</span>
          </h1>
          <p className="home-subtitle">
            Select a platform to explore your stats, visualize progress, and join the discussion.
          </p>
        </header>

        {/* ── Platform Cards ── */}
        <div className="home-platforms">
          {PLATFORMS.map((p, i) => (
            <button
              key={p.id}
              id={`platform-${p.id}`}
              className={`platform-card glass glass-hover platform-card--${p.accent} animate-slide-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => navigate(p.path)}
              aria-label={`Go to ${p.name} dashboard`}
            >
              <div className="platform-card-icon">{p.icon}</div>
              <h2 className="platform-card-name">{p.name}</h2>
              <p className="platform-card-tagline">{p.tagline}</p>
              <ul className="platform-card-features">
                {p.stats.map(s => (
                  <li key={s} className="platform-card-feature">
                    <span className="platform-check">✓</span> {s}
                  </li>
                ))}
              </ul>
              <div className="platform-card-cta">
                Open Dashboard <span>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* ── Discussion shortcut ── */}
        <div className="home-discuss-banner glass animate-fade-in">
          <div className="home-discuss-left">
            <span className="home-discuss-icon">💬</span>
            <div>
              <h3>Community Discussions</h3>
              <p>Ask questions, share approaches, and help others solve tough problems.</p>
            </div>
          </div>
          <button
            id="home-discuss-btn"
            className="btn btn-outline"
            onClick={() => navigate('/discussions')}
          >
            Browse Discussions →
          </button>
        </div>
      </div>
    </div>
  );
}
