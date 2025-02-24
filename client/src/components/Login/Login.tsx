import { Button, Group, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import styles from '../Signup/Signup.module.css';
import { useLogin } from '@/hooks/auth/useLogin';

interface LoginFormValues {
  usernameOrEmail: string;
  password: string;
}

export default function Login() {
  const { mutate: loginMutation, isPending } = useLogin();

  const form = useForm<LoginFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      usernameOrEmail: '',
      password: '',
    },
    validate: {
      usernameOrEmail: (value) => (value.length > 0 ? null : 'Username or Email is required'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
    },
  });

  const handleSubmit = (values: LoginFormValues) => {
    loginMutation(values);
  };


  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className={styles.signupForm}>
      <TextInput
        mb={16}
        withAsterisk
        label="Username or Email"
        {...form.getInputProps('usernameOrEmail')}
      />
      <PasswordInput
        mb={16}
        withAsterisk
        type="password"
        label="Password"
        {...form.getInputProps('password')}
      />
      <Group justify="center" mt="md">
        <Button loading={isPending} type="submit">Login</Button>
      </Group>
    </form>
  );
}
