import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/api/api';
import { useUserStore } from '@/store/user';
import { notifications } from '@mantine/notifications';
import { UpdateProfileResponse, UpdateProfileValues } from '@/types/user';

export function useUpdateProfile() {
  const updateProfile = useUserStore((state) => state.updateProfile);

  return useMutation<UpdateProfileResponse, AxiosError<{ message: string }>, UpdateProfileValues>({
    mutationFn: async (values) => {
      const { data } = await api.put('/user/profile', values);
      return data;
    },
    onSuccess: (data) => {
      updateProfile(data.user);
        notifications.show({
          message: 'Profile updated successfully',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Profile update failed',
          message: error.response?.data.message || 'Something went wrong',
          color: 'red',
        });
      },
  });
}