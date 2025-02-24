export interface RegisterRequest {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}
