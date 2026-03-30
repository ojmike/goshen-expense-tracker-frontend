import api, { setAccessToken } from './api';
import axios from 'axios';

interface AuthResponse {
  accessToken: string;
}

interface UserResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  async refresh(): Promise<AuthResponse> {
    const { data } = await axios.post<AuthResponse>('/api/auth/refresh', {}, {
      withCredentials: true,
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Logout should always clear client state even if server call fails
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  async getMe(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/auth/me');
    return response.data;
  },
};

export default authService;
export type { RegisterData, UserResponse, AuthResponse };
