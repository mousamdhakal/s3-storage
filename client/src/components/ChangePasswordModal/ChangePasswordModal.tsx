import { passwordValidation } from '@/constants/validations';
import { useChangePassword } from '@/hooks/user/useChangePassword';
import { Modal, PasswordInput, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';

interface ChangePasswordModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ opened, onClose }: ChangePasswordModalProps) {
    const { mutate: changePassword, isPending } = useChangePassword();
  
  
  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: passwordValidation,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    changePassword(values);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Change Password" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <PasswordInput
          label="Current Password"
          {...form.getInputProps('currentPassword')}
          mb="md"
        />
        <PasswordInput
          label="New Password"
          {...form.getInputProps('newPassword')}
          mb="md"
        />
        <PasswordInput
          label="Confirm New Password"
          {...form.getInputProps('confirmPassword')}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button loading={isPending} type="submit">Change Password</Button>
        </Group>
      </form>
    </Modal>
  );
}