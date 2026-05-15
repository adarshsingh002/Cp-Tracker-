import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cp_token'));

  const loginCtx = useCallback((userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('cp_user', JSON.stringify(userData));
    localStorage.setItem('cp_token', jwt);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cp_user');
    localStorage.removeItem('cp_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loginCtx, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
