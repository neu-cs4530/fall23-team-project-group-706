/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/naming-convention */
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
import { ClientToServerEvents, ServerToClientEvents } from './types/CoveyTownSocket';
import { TownsController } from './town/TownsController';
import { logError } from './Utils';

dotenv.config();
// Create the server instances
const app = Express();
app.use(CORS());
const server = http.createServer(app);
const socketServer = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' },
});

const spotifyApi = new SpotifyWebApi({
  clientId: 'c7352d2289f4409c8f20675c19846d05', // process.env.SPOTIFY_CLIENT_ID || '',
  clientSecret: '4d4a02b8ee564d33963088f2a9a5cbb2', // process.env.SPOTIFY_CLIENT_SECRET || '',
  redirectUri: 'http://localhost:3000/authorize',
});

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

<<<<<<< HEAD
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
    console.error('Error refreshing access token:', error);
  }
};

// Authorization route
app.get('/authorize', async (req, res) => {
  const code = req.query.code as string;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(data.body.refresh_token);
    setTimeout(refreshAccessToken, data.body.expires_in * 1000);
    res.json({ message: 'Authorization successful' });
  } catch (error) {
    res.status(500).json({ message: 'Authorization failed', error });
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
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Error searching songs', error });
  }
});

// Play a song
app.put('/play', async (req, res) => {
  const { uri } = req.body;
  try {
    await spotifyApi.play({ uris: [uri] });
    res.json({ message: 'Playback started' });
  } catch (error) {
    res.status(500).json({ message: 'Error playing song', error });
  }
});

// Pause playback
app.put('/pause', async (req, res) => {
  try {
    await spotifyApi.pause();
    res.json({ message: 'Playback paused' });
  } catch (error) {
    res.status(500).json({ message: 'Error pausing playback', error });
  }
});

// Add a song to the queue
app.post('/queue', async (req, res) => {
  const { uri } = req.body;
  try {
    await spotifyApi.addToQueue(uri);
    res.json({ message: 'Song added to queue' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding song to queue', error });
  }
});

=======
>>>>>>> parent of 4ccf349 (updated files)
// Start the configured server, defaulting to port 8081 if $PORT is not set
server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    TownsStore.getInstance().createTown(process.env.DEMO_TOWN_ID, false);
  }
});
