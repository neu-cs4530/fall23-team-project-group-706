import { Button } from '@chakra-ui/react';
import React from 'react';

const CLIENT_ID = encodeURIComponent('c7352d2289f4409c8f20675c19846d05');
const REDIRECT_URI = encodeURIComponent('https://jukebox-oew9.onrender.com/towns');
const SCOPE = encodeURIComponent(
  'user-read-private user-read-email user-modify-playback-state user-read-playback-state',
);
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;

const LoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  return (
    <Button colorScheme='blue' onClick={handleLogin}>
      Login to Music Player
    </Button>
  );
};

export default LoginButton;
