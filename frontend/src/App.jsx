import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import CodeforcesDashboard from './pages/CodeforcesDashboard.jsx';
import LeetCodeDashboard from './pages/LeetCodeDashboard.jsx';
import DiscussionsPage from './pages/DiscussionsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/codeforces" element={<ProtectedRoute><CodeforcesDashboard /></ProtectedRoute>} />
        <Route path="/leetcode" element={<ProtectedRoute><LeetCodeDashboard /></ProtectedRoute>} />
        <Route path="/discussions" element={<ProtectedRoute><DiscussionsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
