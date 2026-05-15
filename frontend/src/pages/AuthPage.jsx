import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { login, signup } from '../api.js';
import './AuthPage.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginCtx } = useAuth();
  const navigate = useNavigate();

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(username.trim(), password);
        loginCtx(data.user, data.token);
        navigate('/');
      } else {
        await signup(username.trim(), password);
        setMode('login');
        setPassword('');
        setError('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <span className="auth-brand-icon">◈</span>
            <span className="auth-brand-name">CPTracker</span>
          </div>
          <h1 className="auth-headline">
            Track.<br />
            Analyze.<br />
            <span className="gradient-text">Dominate.</span>
          </h1>
          <p className="auth-tagline">
            Your all-in-one competitive programming companion. Visualize your Codeforces stats, search LeetCode problems, and collaborate in community discussions.
          </p>
          <div className="auth-features">
            {[
              { icon: '⚡', label: 'Codeforces Stats' },
              { icon: '🧩', label: 'LeetCode Analytics' },
              { icon: '💬', label: 'Problem Discussions' },
            ].map(f => (
              <div key={f.label} className="auth-feature-chip">
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
          <div className="auth-orbs">
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-card glass animate-slide-up">
          <div className="auth-tabs">
            <button
              id="auth-tab-login"
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          <h2 className="auth-form-title">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="auth-form-sub">
            {isLogin
              ? 'Sign in to access your dashboard'
              : 'Join to track your CP journey'}
          </p>

          {error && (
            <div className="auth-error" role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="auth-username">Username</label>
              <input
                id="auth-username"
                className="form-input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </div>
            <button
              id="auth-submit-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="auth-switch-btn"
              onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError(''); }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
