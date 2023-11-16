/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { URLSearchParams } from 'url';

const app = express();
const port = 3000;

// Replace with your Spotify application credentials and redirect URI
const clientId = 'YOUR_CLIENT_ID';
const clientSecret = 'YOUR_CLIENT_SECRET';
const redirectUri = 'YOUR_REDIRECT_URI';

function generateRandomString(length: number): string {
  let text = '';
  const allALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += allALPHA.charAt(Math.floor(Math.random() * allALPHA.length));
  }
  return text;
}

const state = generateRandomString(16);

app.get('/login', (req, res) => {
  const scopes = ' streaming user-read-private user-read-email';
  res.redirect(
    `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state,
    })}`,
  );
});

app.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code as string;

  if (!authorizationCode) {
    return res.status(400).send('Authorization code is required');
  }

  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error requesting access token:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => console.info(`Listening on port ${port}`));
