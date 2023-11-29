/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import SpotifyWebApi from 'spotify-web-api-node';
import { app } from './Server';

jest.mock('spotify-web-api-node');

describe('/authorize route', () => {
  let spotifyApi: SpotifyWebApi;

  beforeEach(() => {
    jest.clearAllMocks();
    spotifyApi = new SpotifyWebApi(); // Create a new instance for each test
  });

  it('successfully authorizes', async () => {
    (spotifyApi.authorizationCodeGrant as jest.Mock).mockResolvedValue({
      body: {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
      },
    });
    (spotifyApi.setRefreshToken as jest.Mock).mockImplementation(() => {});

    const response = await request(app).get('/authorize?code=valid_code');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600,
    });
  });

  it('returns 400 if code is missing', async () => {
    const response = await request(app).get('/authorize');
    expect(response.status).toBe(400);
    expect(response.text).toContain('Code is required');
  });

  // Test is not required as Express will treat all query parameters as a string so kinda makes not sense to test it
  // Left it here just so you know I thought about it - Yinka
  // it('returns 400 if code is not a string', async () => {
  //   const response = await request(app).get('/authorize?code=123');
  //   expect(response.status).toBe(400);
  //   expect(response.body).toEqual({ message: 'Invalid request: code must be a string.' });
  // });

  it('returns 500 if authorization fails', async () => {
    (spotifyApi.authorizationCodeGrant as jest.Mock).mockRejectedValueOnce(
      new Error('Authorization failed'),
    );
    const response = await request(app).get('/authorize?code=valid_code');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Authorization failed',
      error: expect.any(Object), // Adjusted to match the error.message
    });
  });
});
