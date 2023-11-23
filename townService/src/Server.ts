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
import { RegisterRoutes } from '../generated/routes';
import TownsStore from './lib/TownsStore';
import { ClientToServerEvents, ServerToClientEvents } from './types/CoveyTownSocket';
import { TownsController } from './town/TownsController';
import { logError } from './Utils';
import JukeBoxMusic from './town/music/JukeBoxMusic';

dotenv.config();
// Create the server instances
const app = Express();
app.use(CORS());
const server = http.createServer(app);
const socketServer = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' },
});
const service = new JukeBoxMusic();

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

// const clientId = process.env.SPOTIFY_CLIENT_ID as string;
// const redirectUri = process.env.REDIRECT_URI as string;
const scopes = 'user-read-private user-read-email';

app.get('/redirect', (req, res) => {
  const encodedClientId = encodeURIComponent('c7352d2289f4409c8f20675c19846d05');
  const redirect = encodeURIComponent('http://localhost:3000/authorize');
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${encodedClientId}&&scope=${encodeURIComponent(
    scopes,
  )}&redirect_uri=${redirect}`;
  res.redirect(authUrl);
});

// Define a route for authorization
app.post('/authorize', async (req, res) => {
  try {
    const data = await service.authorize(req.body);
    res.json(data);
    res.status(200).json({ message: 'Authorization successful' });
  } catch (error) {
    res.status(500).send('Authentication failed');
  }
});

// Define a route for searching songs
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      res.status(404).send('No query specified');
    }

    const response = await service.search(query);
    res.json(response);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

// Start the configured server, defaulting to port 8081 if $PORT is not set
server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    TownsStore.getInstance().createTown(process.env.DEMO_TOWN_ID, false);
  }
});
