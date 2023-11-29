/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import SpotifyWebApi from 'spotify-web-api-node';
import { app } from './Server';
import { SpotifyTrack } from './types/CoveyTownSocket';

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
      error: 'Authorization failed', // Adjusted to match the error.message
    });
  });
});

describe('/search route', () => {
  let spotifyApi: SpotifyWebApi;

  beforeEach(() => {
    jest.clearAllMocks();
    spotifyApi = new SpotifyWebApi();
  });

  it('returns search results successfully', async () => {
    const mockSearchResults = {
      body: {
        tracks: {
          items: [
            {
              id: 'track1',
              name: 'Song 1',
              artists: [{ name: 'Artist 1' }],
              album: {
                name: 'Album 1',
                images: [{ url: 'https://example.com/album1.jpg' }],
              },
              uri: 'spotify:track:track1',
            },
            {
              id: 'track2',
              name: 'Song 2',
              artists: [{ name: 'Artist 2' }],
              album: {
                name: 'Album 2',
                images: [{ url: 'https://example.com/album2.jpg' }],
              },
              uri: 'spotify:track:track2',
            },
          ],
        },
      },
    };

    (spotifyApi.searchTracks as jest.Mock).mockResolvedValueOnce(mockSearchResults);

    const response = await request(app).get('/search?query=valid_query');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSearchResults.body.tracks.items);
  });

  it('returns an empty array when no search results are found', async () => {
    const mockEmptySearchResults = {
      body: {
        tracks: {
          items: [], // Empty array for no results
        },
      },
    };

    (spotifyApi.searchTracks as jest.Mock).mockResolvedValueOnce(mockEmptySearchResults);

    const response = await request(app).get('/search?query=valid_query');
    expect(response.status).toBe(200); // Still a successful status code
    expect(response.body).toEqual([]);
  });

  it('returns 500 if there is an error searching songs', async () => {
    (spotifyApi.searchTracks as jest.Mock).mockRejectedValueOnce(new Error('Search failed'));

    const response = await request(app).get('/search?query=valid_query');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Error searching songs',
      error: 'Search failed',
    });
  });
});

describe('/play route', () => {
  let spotifyApi: SpotifyWebApi;

  beforeEach(() => {
    jest.clearAllMocks();
    spotifyApi = new SpotifyWebApi();
  });

  it('successfully starts playback', async () => {
    (spotifyApi.play as jest.Mock).mockResolvedValueOnce({});

    const response = await request(app).post('/play').send({ uri: 'spotify:track:valid_uri' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Playback started' });
  });

  it('returns 500 if there is an error playing song', async () => {
    (spotifyApi.play as jest.Mock).mockRejectedValueOnce(new Error('Playback error'));

    const response = await request(app).post('/play').send({ uri: 'spotify:track:valid_uri' });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Error playing song on backend',
      error: 'Playback error',
    });
  });
});

describe('/pause route', () => {
  let spotifyApi: SpotifyWebApi;

  beforeEach(() => {
    jest.clearAllMocks();
    spotifyApi = new SpotifyWebApi();
  });

  it('successfully pauses playback', async () => {
    (spotifyApi.pause as jest.Mock).mockResolvedValueOnce({});

    const response = await request(app).post('/pause');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Playback paused' });
  });

  it('returns 500 if there is an error pausing playback', async () => {
    (spotifyApi.pause as jest.Mock).mockRejectedValueOnce(new Error('Pause error'));

    const response = await request(app).post('/pause');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Error pausing playback',
      error: 'Pause error',
    });
  });
});

describe('/queue POST route', () => {
  let spotifyApi: SpotifyWebApi;

  beforeEach(() => {
    jest.clearAllMocks();
    spotifyApi = new SpotifyWebApi();
  });

  it('successfully adds a song to the queue', async () => {
    (spotifyApi.addToQueue as jest.Mock).mockResolvedValueOnce({});

    const track = { uri: 'spotify:track:valid_uri' };
    const response = await request(app).post('/queue').send(track);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Song added to queue', QUEUE: [track] });
  });

  it('returns 400 if track URI is missing', async () => {
    const response = await request(app).post('/queue').send({});
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Song URI is required' });
  });

  it('returns 500 if there is an error adding song to queue', async () => {
    (spotifyApi.addToQueue as jest.Mock).mockRejectedValueOnce(new Error('Queue error'));

    const track = { uri: 'spotify:track:valid_uri' };
    const response = await request(app).post('/queue').send(track);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Error adding song to queue',
      error: 'Queue error',
    });
  });
});

describe('/queue GET route', () => {
  it('returns the current queue', async () => {
    const response = await request(app).get('/queue');
    expect(response.status).toBe(200);
    // This assertion depends on the state of the queue; adjust as necessary
    expect(response.body).toEqual([]); // Assuming the queue is initially empty
  });

  it('returns a non-empty queue', async () => {
    const track = { uri: 'spotify:track:valid_uri' };
    await request(app).post('/queue').send(track);
    const response = await request(app).get('/queue');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0); // Expecting the queue to be non-empty
  });

  it('returns a queue containing the mock track', async () => {
    const mockTrack: SpotifyTrack = {
      uri: 'spotify:track:valid_uri',
      name: 'MockSong',
      artists: [{ id: 'MockArtistID', name: 'MockArtist' }],
      id: 'MockID',
      album: {
        id: 'MockAlbumID',
        name: 'MockAlbum',
        images: [{ height: 5, width: 5, url: 'https://example.com/mockalbum.jpg' }],
      },
    };
    await request(app).post('/queue').send(mockTrack);
    const response = await request(app).get('/queue');
    expect(response.status).toBe(200);

    const queue: SpotifyTrack[] = response.body;

    // Check the length of the queue
    expect(response.body.length).toBeGreaterThan(0);

    // Find the mock track in the queue
    const addedTrack = queue.find(track => track.id === mockTrack.id);

    // Check that the mock track details match
    expect(addedTrack).toBeDefined();
    expect(addedTrack?.uri).toBe(mockTrack.uri);
    expect(addedTrack?.name).toBe(mockTrack.name);
    expect(addedTrack?.artists[0].id).toBe(mockTrack.artists[0].id);
    expect(addedTrack?.artists[0].name).toBe(mockTrack.artists[0].name);
    expect(addedTrack?.album.name).toBe(mockTrack.album.name);
    expect(addedTrack?.album.images[0].url).toBe(mockTrack.album.images[0].url);
  });
});
