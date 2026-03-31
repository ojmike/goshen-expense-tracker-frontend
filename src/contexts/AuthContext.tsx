import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { setAccessToken } from '../services/api';
import authService, { type RegisterData } from '../services/authService';

interface User {
  email: string;
  firstName: string | null;
  lastName: string | null;
  trackingStartYear: number | null;
  trackingStartMonth: number | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setTrackingStart: (year: number, month: number) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const mapUserResponse = (me: { email: string; firstName: string | null; lastName: string | null; trackingStartYear: number | null; trackingStartMonth: number | null }): User => ({
  email: me.email,
  firstName: me.firstName,
  lastName: me.lastName,
  trackingStartYear: me.trackingStartYear,
  trackingStartMonth: me.trackingStartMonth,
});

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
        setUser(mapUserResponse(me));
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
    setUser(mapUserResponse(me));
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const { accessToken } = await authService.register(data);
    setAccessToken(accessToken);
    const me = await authService.getMe();
    setUser(mapUserResponse(me));
  }, []);

  const setTrackingStart = useCallback(async (year: number, month: number) => {
    const me = await authService.setTrackingStart(year, month);
    setUser((prev) => prev ? { ...prev, trackingStartYear: me.trackingStartYear, trackingStartMonth: me.trackingStartMonth } : null);
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
      setTrackingStart,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
