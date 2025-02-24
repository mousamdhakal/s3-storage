import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/api/api';
import { useUserStore } from '@/store/user';
import { AuthResponse, LoginFormValues } from '@/types/auth';
import { notifications } from '@mantine/notifications';

export function useLogin() {
  const login = useUserStore((state) => state.login);

  return useMutation<AuthResponse, AxiosError<{ message: string }>, LoginFormValues>({
    mutationFn: async (values) => {
      const { data } = await api.post('/auth/login', values);
      return data;
    },
    onSuccess: (data) => {
        login(data);
        notifications.show({
          message: 'Logged in successfully',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Login failed',
          message: error.response?.data.message || 'Something went wrong',
          color: 'red',
        });
      },
  });
}