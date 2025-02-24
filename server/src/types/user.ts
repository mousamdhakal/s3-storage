export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstname?: string;
  lastname?: string;
}
