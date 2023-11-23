import React from 'react';
import * as dotenv from 'dotenv';

// dotenv.config();

const SpotifyLoginButton = () => {
  // const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string; 
  const encodedclientID = encodeURIComponent('c7352d2289f4409c8f20675c19846d05');
  const REDIRECT_URI = encodeURIComponent('http://localhost:3000/authorize'); 
  const SCOPES = encodeURIComponent(['user-read-private', 'user-read-email'].join(' ')); // Spotify scopes
  const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';

  const handleLogin = () => {
    window.location.href = `${SPOTIFY_AUTHORIZE_URL}?response_type=code&client_id=${encodedclientID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}`;
  };
  return (
    <button onClick={handleLogin}>Login with Spotify</button>
  );
};

export default SpotifyLoginButton;
  
