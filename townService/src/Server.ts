import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
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

// Create the server instances
const app = Express();
app.use(CORS());
const server = http.createServer(app);
const socketServer = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' },
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

const CLIENTID = process.env.CLIENTID || '';
const CLIENTSECRET = process.env.CLIENTSECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URL || '';

function generateRandomString(length: number): string {
  let text = '';
  const allALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += allALPHA.charAt(Math.floor(Math.random() * allALPHA.length));
  }
  return text;
}

const STATE = generateRandomString(16);

app.get('/login', (req, res) => {
  const scopes = ' streaming user-read-private user-read-email';
  res.redirect(
    `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: CLIENTID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
      state: STATE,
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
    redirect_uri: REDIRECT_URI,
    client_id: CLIENTID,
    client_secret: CLIENTSECRET,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENTID}:${CLIENTSECRET}`).toString('base64')}`,
      },
      body: params,
    });

    if (!response.ok) {
      return res.status(404).send('Sonething went wrong in callback');
    }

    const data = await response.json();
    res.json(data);
    return res.status(200).send('worked');
  } catch (error) {
    console.error('Error requesting access token:', error);
    return res.status(500).send('Internal Server Error');
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
