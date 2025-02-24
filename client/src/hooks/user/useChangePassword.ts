import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import api from '@/api/api';
import { useUserStore } from '@/store/user';
import { ChangePasswordResponse, ChangePasswordValues } from '@/types/user';

export function useChangePassword() {
  const logout = useUserStore((state) => state.logout);

  return useMutation<ChangePasswordResponse, AxiosError<{ message: string }>, ChangePasswordValues>(
    {
      mutationFn: async (values) => {
        // we don't need confirmPassword in server, so removing it
        values.confirmPassword = undefined;
        const { data } = await api.put('/user/password', values);
        return data;
      },
      onSuccess: () => {
        logout();
        notifications.show({
          title: 'Password changed successfully',
          message: 'Please login with your new password',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Password update failed',
          message: error.response?.data.message || 'Something went wrong',
          color: 'red',
        });
      },
    }
  );
}
