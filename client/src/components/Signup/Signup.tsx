import { Button, Group, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRegister } from '@/hooks/auth/useRegister';
import { RegisterFormValues } from '@/types/auth';
import styles from './Signup.module.css';
import { passwordValidation } from '@/constants/validations';

export default function Signup() {
  const { mutate: registerMutation, isPending } = useRegister();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      username: (value) => (value.length >= 3 ? null : 'Username is too short'),
      password: passwordValidation,
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  const handleSubmit = (values: RegisterFormValues) => {
    registerMutation(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className={styles.signupForm}>
      <TextInput
        mb={16}
        withAsterisk
        label="Username"
        placeholder="username"
        {...form.getInputProps('username')}
      />
      <PasswordInput
        mb={16}
        withAsterisk
        type="password"
        label="Password"
        {...form.getInputProps('password')}
      />
      <PasswordInput
        mb={16}
        withAsterisk
        type="password"
        label="Confirm password"
        {...form.getInputProps('confirmPassword')}
      />
      <Group justify="center" mt="md">
        <Button loading={isPending} type="submit">
          Sign Up
        </Button>
      </Group>
    </form>
  );
}
