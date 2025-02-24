import { useState } from 'react';
import { Box, Center, Grid, Image, SegmentedControl } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
// import { SegmentedControl } from '@/components/common/SegmentedControl/SegmentedControl';
import LoginScreenImage from '../../assets/illustrations/login-screen.svg';
import styles from './auth.module.css';
import Signup from '@/components/Signup/Signup';
import Login from '@/components/Login/Login';

const AuthPage = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState('Login');

  return (
    <Box className={styles.container}>
      <Box className={styles.box}>
        <Grid gutter={0}>
          {!isMobile && (
            <Grid.Col span={6}>
              <div className={styles.imageContainer}>
                <Image
                  src={LoginScreenImage}
                  alt="Login Screen Illustration"
                  height="100%"
                  fit="cover"
                />
              </div>
            </Grid.Col>
          )}
          <Grid.Col span={isMobile ? 12 : 6}>
            <Box className={styles.formContainer}>
              <Center>
                <SegmentedControl data={['Login', 'Sign Up']} onChange={setActiveTab} />
              </Center>
              <Center mt={16}>
                {activeTab === 'Login' ? (
                  <Login />
                ) : (
                  <Signup />
                )}
              </Center>
            </Box>
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
};

export default AuthPage;
