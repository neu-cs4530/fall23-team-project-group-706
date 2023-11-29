/* eslint-disable @typescript-eslint/naming-convention */
const mockSpotifyWebApi = {
  authorizationCodeGrant: jest.fn(),
  setAccessToken: jest.fn(),
  setRefreshToken: jest.fn(),
  searchTracks: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  addToQueue: jest.fn(),
};

// Mock constructor implementation
const SpotifyWebApi = jest.fn().mockImplementation(() => mockSpotifyWebApi);
export default SpotifyWebApi;
