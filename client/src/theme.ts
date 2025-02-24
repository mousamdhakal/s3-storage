import { createTheme } from '@mantine/core';

export const theme = createTheme({
  components: {
    TextInput: {
      defaultProps: {
        classNames: {
          label: 'input-label',
        },
      },
    },
    PasswordInput: {
      defaultProps: {
        classNames: {
          label: 'input-label',
        },
      },
    },
  },
});
