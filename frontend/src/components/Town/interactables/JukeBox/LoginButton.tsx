import React from 'react';


const CLIENT_ID = encodeURIComponent('c7352d2289f4409c8f20675c19846d05');
const REDIRECT_URI = encodeURIComponent('http://localhost:3000'); 
const SCOPE = encodeURIComponent('user-read-private user-read-email'); 
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;

const LoginButton: React.FC = () => {
    return <button onClick={() => window.location.href = AUTH_URL}>Login with Spotify</button>;
};

export default LoginButton;
  
