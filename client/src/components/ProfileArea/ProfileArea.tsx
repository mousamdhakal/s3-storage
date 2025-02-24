import { IconKey, IconLogout, IconUser } from '@tabler/icons-react';
import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useUserStore } from '@/store/user';
import styles from './ProfileArea.module.css';
import { EditProfileModal } from '../EditProfileModal/EditProfileModal';
import { ChangePasswordModal } from '../ChangePasswordModal/ChangePasswordModal';

export default function ProfileArea() {
  const { user, logout } = useUserStore();
  const [editProfileOpened, { open: openEditProfile, close: closeEditProfile }] =
    useDisclosure(false);
  const [changePasswordOpened, { open: openChangePassword, close: closeChangePassword }] =
    useDisclosure(false);

  const handleLogout = () => {
    logout();
    notifications.show({
      message: 'Logged out successfully',
    });
  };

  return (
    <>
      <Menu position="top" withArrow offset={12}>
        <Menu.Target>
          <UnstyledButton className={styles.userProfileButton} w='100%'>
            <Group>
              <Avatar size="md" color="blue" radius="xl">
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex-1">
                <Text size="sm" fw={500}>
                  {user?.username}
                </Text>
              </div>
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item onClick={openEditProfile} leftSection={<IconUser size={16} />}>
            Edit Profile
          </Menu.Item>
          <Menu.Item onClick={openChangePassword} leftSection={<IconKey size={16} />}>
            Change Password
          </Menu.Item>
          <Menu.Item onClick={handleLogout} color="red" leftSection={<IconLogout size={16} />}>
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <EditProfileModal opened={editProfileOpened} onClose={closeEditProfile} />
      <ChangePasswordModal opened={changePasswordOpened} onClose={closeChangePassword} />
    </>
  );
}
