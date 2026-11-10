export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  token: string;
  user: User;
}

