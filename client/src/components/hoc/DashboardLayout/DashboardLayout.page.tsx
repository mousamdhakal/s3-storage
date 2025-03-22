import { IconFiles, IconHome2, IconLogs, IconUpload, IconUsers} from '@tabler/icons-react';
import { Outlet, NavLink as RouterLink } from 'react-router-dom';
import {
  AppShell,
  Box,
  Burger,
  Group,
  Image,
  NavLink,
  ScrollArea,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Logo from '@/assets/image/logo.png';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import ProfileArea from '@/components/ProfileArea/ProfileArea';
import { useGetAppliedColorScheme } from '@/hooks/ui/useGetAppliedColorScheme';

export default function DashboardLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const colorScheme  = useGetAppliedColorScheme();

  const handleNavClick = () => {
    // Only close sidebar on mobile view
    if (window.innerWidth < 768) { // sm breakpoint
      closeMobile();
    }
  };

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
        <Group h="100%" px="md" justify="space-between" style={{ position: 'relative' }}>
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
            style={{ position: 'absolute', left: 16 }}
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
            style={{ position: 'absolute', left: 16 }}
          />
          <Group style={{ flex: 1, justifyContent: 'center' }}>
            <Image
              src={Logo}
              alt="Yourcloud Logo"
              h={50}
              w="auto"
              fit="contain"
            />
          </Group>
          <Box visibleFrom="sm">
            <ColorSchemeToggle />
          </Box>
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
            onClick={handleNavClick}
          />
          <NavLink
            label="Upload"
            to="/upload"
            mb={8}
            component={RouterLink}
            leftSection={<IconUpload size={16} stroke={1.5} />}
            onClick={handleNavClick}
          />
          <NavLink
            label="Files"
            to="/files"
            mb={8}
            component={RouterLink}
            leftSection={<IconFiles size={16} stroke={1.5} />}
            onClick={handleNavClick}
          />
          <NavLink
            label="Logs"
            to="/logs"
            mb={8}
            component={RouterLink}
            leftSection={<IconLogs size={16} stroke={1.5} />}
            onClick={handleNavClick}
          />
        </AppShell.Section>

        <AppShell.Section>
          <Box hiddenFrom="sm" mb="md">
            <ColorSchemeToggle />
          </Box>
          <ProfileArea />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
