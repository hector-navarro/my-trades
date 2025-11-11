import { createContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login: (newToken: string) => {
        setToken(newToken);
        navigate('/', { replace: true });
      },
      logout: () => {
        setToken(null);
        navigate('/login', { replace: true });
      }
    }),
    [token, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
