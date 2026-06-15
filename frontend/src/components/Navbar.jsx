import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/',            label: 'Home',        icon: '⌂' },
  { to: '/codeforces',  label: 'Codeforces',  icon: '⚡' },
  { to: '/leetcode',    label: 'LeetCode',    icon: '🧩' },
  { to: '/discussions', label: 'Discuss',     icon: '💬' },
  { to: '/workspace',   label: 'Workspace',   icon: '⚙' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <nav className="navbar glass" role="navigation" aria-label="Main navigation">
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">◈</span>
        <span className="navbar-brand-text">CP<span className="gradient-text">Tracker</span></span>
      </Link>

      <div className="navbar-links">
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            <span className="navbar-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <div className="navbar-user">
              <div className="navbar-avatar">{user.username[0].toUpperCase()}</div>
              <span className="navbar-username">{user.username}</span>
            </div>
            <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
