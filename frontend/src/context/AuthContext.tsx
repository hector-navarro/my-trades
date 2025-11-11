import { createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  id: number;
  email: string;
  full_name?: string;
}

interface AuthContextValue {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  isAuthenticated: false,
  login: () => undefined,
  logout: () => undefined
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as UserInfo) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        navigate('/');
      },
      logout: () => {
        setToken(null);
        setUser(null);
        navigate('/login');
      }
    }),
    [navigate, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
