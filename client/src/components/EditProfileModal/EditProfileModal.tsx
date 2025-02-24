import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useUpdateProfile } from '@/hooks/user/useUpdateProfile';
import { useUserStore } from '@/store/user';

interface EditProfileModalProps {
  opened: boolean;
  onClose: () => void;
}

export function EditProfileModal({ opened, onClose }: EditProfileModalProps) {
  const { user } = useUserStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm({
    initialValues: {
      email: user?.email || '',
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    updateProfile(values);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Profile" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Email" {...form.getInputProps('email')} mb="md" />
        <TextInput label="First name" {...form.getInputProps('firstname')} mb="md" />
        <TextInput label="Last name" {...form.getInputProps('lastname')} mb="md" />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={isPending} type="submit">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
