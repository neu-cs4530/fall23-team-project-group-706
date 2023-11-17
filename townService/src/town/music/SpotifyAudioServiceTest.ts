global.fetch = jest.fn();

describe('SpotifyAudioService', () => {
  let spotifyService: SpotifyAudioService;
  const mockClientId = 'mock-client-id';
  const mockClientSecret = 'mock-client-secret';

  beforeEach(() => {
    spotifyService = new SpotifyAudioService(mockClientId, mockClientSecret);
    jest.clearAllMocks();
  });

  it('should generate the correct Spotify authorization URL', () => {
    const url = spotifyService.getAuthUrl();
    expect(url).toContain('https://accounts.spotify.com/authorize');
    expect(url).toContain(`client_id=${mockClientId}`);
  });

  it('should obtain an access token', async () => {
    const mockCode = 'mock-auth-code';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'mock-access-token' }),
    });

    const accessToken = await spotifyService.getAccessToken(mockCode);

    expect(accessToken).toBe('mock-access-token');
    expect(fetch).toHaveBeenCalledWith(
      'https://accounts.spotify.com/api/token',
      expect.any(Object),
    );
  });

  it('should search for a song and return its URI', async () => {
    const mockSongName = 'Test Song';
    const mockUri = 'spotify:track:mockUri';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ tracks: { items: [{ uri: mockUri }] } }),
    });

    const uri = await spotifyService.searchSongs(mockSongName);

    expect(uri).toBe(mockUri);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`search?q=${encodeURIComponent(mockSongName)}`),
      expect.any(Object),
    );
  });

  it('should play a specified track', async () => {
    const mockSongName = 'Test Song';
    const mockUri = 'spotify:track:mockUri';
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tracks: { items: [{ uri: mockUri }] } }),
      })
      .mockResolvedValueOnce({ ok: true });

    await spotifyService.playTrack(mockSongName);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });

  it('should pause the current playback', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await spotifyService.pauseTrack();

    expect(fetch).toHaveBeenCalledWith(
      `${spotifyService._BASE_URL}/me/player/pause`,
      expect.objectContaining({ method: 'PUT' }),
    );
  });
});
