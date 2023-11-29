/* eslint-disable @typescript-eslint/naming-convention */
const mockSpotifyWebApi = {
  authorizationCodeGrant: jest.fn(),
  setAccessToken: jest.fn(),
  setRefreshToken: jest.fn(),
  // ... other mocked methods
};

// Mock constructor implementation
const SpotifyWebApi = jest.fn().mockImplementation(() => mockSpotifyWebApi);
export default SpotifyWebApi;
