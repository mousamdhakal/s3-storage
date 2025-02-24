export const passwordValidation = (value: string) => {
  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (!/[A-Za-z]/.test(value)) {
    return 'Password must contain at least one alphabet';
  }
  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return 'Password must contain at least one special character';
  }
  return null;
};
