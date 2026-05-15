import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="notfound-page">
      <div className="notfound-content glass animate-slide-up">
        <div className="notfound-code gradient-text">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-sub">The page you're looking for doesn't exist or was moved.</p>
        <button id="notfound-home-btn" className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
          ← Go Home
        </button>
      </div>
      <div className="notfound-orb" aria-hidden="true" />
    </div>
  );
}
