import { IconHome2, IconUpload, IconUsers} from '@tabler/icons-react';
import { Outlet, NavLink as RouterLink } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ProfileArea from '@/components/ProfileArea/ProfileArea';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';

export default function DashboardLayout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: 200, md: 200, lg: 200 },
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Text size="xl">Logo</Text>
          </Group>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow my="md" component={ScrollArea}>
          <NavLink
            label="Dashboard"
            to="/dashboard"
            mb={8}
            component={RouterLink}
            leftSection={<IconHome2 size={16} stroke={1.5} />}
          />
          <NavLink
            label="Upload"
            to="/upload"
            mb={8}
            component={RouterLink}
            leftSection={<IconUpload size={16} stroke={1.5} />}
          />
        </AppShell.Section>

        <AppShell.Section>
          <ProfileArea />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
