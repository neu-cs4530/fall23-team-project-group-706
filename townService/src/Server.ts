/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import * as dotenv from 'dotenv';
import { AddressInfo } from 'net';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import fs from 'fs/promises';
import { Server as SocketServer } from 'socket.io';
import SpotifyWebApi from 'spotify-web-api-node';
import { RegisterRoutes } from '../generated/routes';
import TownsStore from './lib/TownsStore';
import { ClientToServerEvents, ServerToClientEvents, SpotifyTrack } from './types/CoveyTownSocket';
import { TownsController } from './town/TownsController';
import { logError } from './Utils';

dotenv.config();
// Create the server instances
export const app = Express();
app.use(CORS());
const server = http.createServer(app);
const socketServer = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, { 
  cors: { origin: 'https://jukebox-oew9.onrender.com/towns' },
});

export const spotifyApi = new SpotifyWebApi({
  clientId: 'c7352d2289f4409c8f20675c19846d05', // process.env.SPOTIFY_CLIENT_ID || '',
  clientSecret: '4d4a02b8ee564d33963088f2a9a5cbb2', // process.env.SPOTIFY_CLIENT_SECRET || '',
  redirectUri: 'https://jukebox-oew9.onrender.com/towns',
});
const QUEUE: SpotifyTrack[] = [];

// Initialize the towns store with a factory that creates a broadcast emitter for a town
TownsStore.initializeTownsStore((townID: string) => socketServer.to(townID));

// Connect the socket server to the TownsController. We use here the same pattern as tsoa
// (the library that we use for REST), which creates a new controller instance for each request
socketServer.on('connection', socket => {
  new TownsController().joinTown(socket);
});

// Set the default content-type to JSON
app.use(Express.json());

// Add a /docs endpoint that will display swagger auto-generated documentation
app.use('/docs', swaggerUi.serve, async (_req: Express.Request, res: Express.Response) => {
  const swaggerSpec = await fs.readFile('../shared/generated/swagger.json', 'utf-8');
  return res.send(swaggerUi.generateHTML(JSON.parse(swaggerSpec)));
});

// Register the TownsController routes with the express server
RegisterRoutes(app);

// Add a middleware for Express to handle errors
app.use(
  (
    err: unknown,
    _req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction,
  ): Express.Response | void => {
    if (err instanceof ValidateError) {
      return res.status(422).json({
        message: 'Validation Failed',
        details: err?.fields,
      });
    }
    if (err instanceof Error) {
      logError(err);
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }

    return next();
  },
);

// Function to refresh token
const refreshAccessToken = async () => {
  try {
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body.access_token);
    const expiresIn = data.body.expires_in;
    const refreshBuffer = 300;
    const refreshIn = (expiresIn - refreshBuffer) * 1000;
    setTimeout(refreshAccessToken, refreshIn);
  } catch (error) {
    throw new Error('Error refreshing access token:');
  }
};

// Authorization route
app.get('/authorize', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Code is required');
  }
  if (typeof code !== 'string') {
    return res.status(400).json({ message: 'Invalid request: code must be a string.' });
  }
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(data.body.refresh_token);
    // Schedule the next refresh
    setTimeout(refreshAccessToken, (data.body.expires_in - 300) * 1000);
    // Send back the tokens and expiration time to the client
    return res.json({
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expires_in: data.body.expires_in,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Authorization failed', error: (error as Error).message || error });
  }
});

// Additional routes for searching songs, playing a song, pausing a song...
// Example: Search songs
app.get('/search', async (req, res) => {
  try {
    const results = await spotifyApi.searchTracks(req.query.query as string);
    if (results.body.tracks && results.body.tracks.items) {
      res.json(results.body.tracks.items);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error searching songs', error: (error as Error).message || error });
  }
});

// Play a song
app.post('/play', async (req, res) => {
  const { uri } = req.body;
  try {
    await spotifyApi.play({ uris: [uri] });
    res.json({ message: 'Playback started' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error playing song on backend', error: (error as Error).message || error });
  }
});

// Pause playback
app.post('/pause', async (req, res) => {
  try {
    await spotifyApi.pause();
    res.json({ message: 'Playback paused' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error pausing playback', error: (error as Error).message || error });
  }
});

// Add a song to the queue
app.post('/queue', async (req, res) => {
  const track = req.body;
  if (!track || !track.uri) {
    return res.status(400).json({ message: 'Song URI is required' });
  }
  try {
    await spotifyApi.addToQueue(track.uri);
    QUEUE.push(track);
    return res.json({ message: 'Song added to queue', QUEUE });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error adding song to queue', error: (error as Error).message || error });
  }
});

// Endpoint to get the current queue
app.get('/queue', (req, res) => res.json(QUEUE));

// Start the configured server, defaulting to port 8081 if $PORT is not set
server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    TownsStore.getInstance().createTown(process.env.DEMO_TOWN_ID, false);
  }
});
