import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/api/api';
import { useUserStore } from '@/store/user';
import { AuthResponse, RegisterFormValues } from '@/types/auth';
import { notifications } from '@mantine/notifications';

export function useRegister() {
  const login = useUserStore((state) => state.login);

  return useMutation<AuthResponse, AxiosError<{ message: string }>, RegisterFormValues>({
    mutationFn: async (values) => {
      const { data } = await api.post('/auth/register', values);
      return data;
    },
    onSuccess: (data) => {
        login(data);
        notifications.show({
          message: 'Signed up successfully',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Register failed',
          message: error.response?.data.message || 'Something went wrong',
          color: 'red',
        });
      },
  });
}