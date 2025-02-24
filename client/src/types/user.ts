import { User } from './auth';

export interface UpdateProfileValues {
  email?: string;
  firstname?: string;
  lastname?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  message: string;
}
