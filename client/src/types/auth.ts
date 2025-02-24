export interface LoginFormValues {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterFormValues {
  username: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
