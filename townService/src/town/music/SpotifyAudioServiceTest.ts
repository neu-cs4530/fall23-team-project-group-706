// Mocking the global fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({ access_token: 'mock_access_token', refresh_token: 'mock_refresh_token' }),
  }),
) as jest.Mock;

describe('SpotifyAudioService', () => {
  it('getAccessToken should return access and refresh tokens', async () => {
    const service = new SpotifyAudioService('client_id', 'client_secret');
    const tokens = await service.getAccessToken('mock_code');

    expect(tokens).toEqual({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });
});
