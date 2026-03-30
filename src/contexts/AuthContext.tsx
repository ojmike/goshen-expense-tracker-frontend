import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { setAccessToken } from '../services/api';
import authService, { type RegisterData } from '../services/authService';

interface User {
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to refresh (httpOnly cookie may have valid refresh token)
  useEffect(() => {
    authService.refresh()
      .then(({ accessToken }) => {
        setAccessToken(accessToken);
        return authService.getMe();
      })
      .then((me) => {
        setUser({ email: me.email, firstName: me.firstName, lastName: me.lastName });
      })
      .catch(() => {
        // Not logged in -- that's fine
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await authService.login(email, password);
    setAccessToken(accessToken);
    const me = await authService.getMe();
    setUser({ email: me.email, firstName: me.firstName, lastName: me.lastName });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const { accessToken } = await authService.register(data);
    setAccessToken(accessToken);
    const me = await authService.getMe();
    setUser({ email: me.email, firstName: me.firstName, lastName: me.lastName });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      login,
      register,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
