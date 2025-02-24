import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { Group, Menu, Text, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import styles from './ColorSchemeToggle.module.css'
const colorSchemeData = [
  { value: 'light', label: 'Light', Icon: IconSun },
  { value: 'dark', label: 'Dark', Icon: IconMoon },
  { value: 'auto', label: 'Auto', Icon: IconDeviceDesktop },
];

/**
 * ColorSchemeToggle component
 * @returns {React.ReactNode} React element with color scheme toggle menu
 */
export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const currentScheme = colorSchemeData.find((item) => item.value === colorScheme);

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <UnstyledButton
          px="md"
          py="xs"
          className={styles.toggleButton}
        >
          <Group gap="xs">
            {currentScheme && <currentScheme.Icon size={16} stroke={1.5} />}
            <Text size="sm">{currentScheme?.label}</Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {colorSchemeData.map(({ value, label, Icon }) => (
          <Menu.Item
            key={value}
            leftSection={<Icon size={16} stroke={1.5} />}
            onClick={() => setColorScheme(value as 'light' | 'dark' | 'auto')}
            bg={value === colorScheme ? 'var(--mantine-color-default-hover)' : undefined}
          >
            {label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
