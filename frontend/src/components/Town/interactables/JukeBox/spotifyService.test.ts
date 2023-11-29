jest.mock('axios');

import axios from 'axios';
import { SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';
import {
  addSongToQueue,
  authorizeUser,
  getQueue,
  pauseSong,
  playSong,
  searchSongs,
} from './spotifyServices';

describe('authorizeUser', () => {
  it('successfully authorizes the user', async () => {
    // Mock axios response
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
      },
    });

    const code = 'valid_code';
    const response = await authorizeUser(code);

    expect(response).toEqual({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600,
    });
  });

  it('throws an error when authorization fails', async () => {
    const errorMessage = 'Authorization failed';
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    const code = 'invalid_code';
    await expect(authorizeUser(code)).rejects.toThrow(errorMessage);
  });
});

describe('searchSongs', () => {
  it('successfully retrieves search results', async () => {
    const mockSearchResults = {
      /* ...mock data... */
    };
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockSearchResults });

    const response = await searchSongs('query');
    expect(response).toEqual(mockSearchResults);
  });

  it('throws an error when search fails', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Search failed'));
    await expect(searchSongs('query')).rejects.toThrow('Search failed');
  });
});

describe('playSong', () => {
  it('successfully plays a song', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({});
    await expect(playSong('spotify:track:valid_uri')).resolves.toBeUndefined();
  });

  it('throws an error when play fails', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Play failed'));
    await expect(playSong('spotify:track:valid_uri')).rejects.toThrow('Play failed');
  });
});

describe('pauseSong', () => {
  it('successfully pauses a song', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({});
    await expect(pauseSong()).resolves.toBeUndefined();
  });

  it('throws an error when pause fails', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Pause failed'));
    await expect(pauseSong()).rejects.toThrow('Pause failed');
  });
});

describe('addSongToQueue', () => {
  const mockTrack: SpotifyTrack = {
    uri: 'spotify:track:valid_uri',
    name: 'MockSong',
    artists: [{ id: 'MockArtistID', name: 'MockArtist' }],
    album: {
      id: 'MockAlbumID',
      name: 'MockAlbum',
      images: [{ height: 5, width: 5, url: 'https://example.com/mockalbum.jpg' }],
    },
    id: 'MockID',
  };
  it('successfully adds a song to the queue', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({});
    const response = await addSongToQueue(mockTrack);
    expect(response).toBe(true);
  });

  it('returns false when adding to queue fails', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Add to queue failed',
      response: {
        data: 'Error data',
      },
    });
    const response = await addSongToQueue(mockTrack);
    expect(response).toBe(false);
  });
});

describe('getQueue', () => {
  it('successfully retrieves the queue', async () => {
    const mockQueue: SpotifyTrack[] = [
      {
        uri: 'spotify:track:valid_uri1',
        name: 'MockSong1',
        artists: [{ id: 'MockArtistID1', name: 'MockArtist1' }],
        album: {
          id: 'MockAlbumID',
          name: 'MockAlbum1',
          images: [{ height: 5, width: 5, url: 'https://example.com/mockalbum1.jpg' }],
        },
        id: 'MockID1',
      },
      {
        uri: 'spotify:track:valid_uri2',
        name: 'MockSong2',
        artists: [{ id: 'MockArtistID2', name: 'MockArtist2' }],
        album: {
          id: 'MockAlbumID',
          name: 'MockAlbum2',
          images: [{ height: 5, width: 5, url: 'https://example.com/mockalbum2.jpg' }],
        },
        id: 'MockID2',
      },
    ];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockQueue });
    const response = await getQueue();
    expect(response).toEqual(mockQueue);

    expect(response[0].name).toBe(mockQueue[0].name);
    expect(response[0].artists[0].name).toBe(mockQueue[0].artists[0].name);
    expect(response[0].uri).toBe(mockQueue[0].uri);
    expect(response[1].name).toBe(mockQueue[1].name);
    expect(response[1].artists[0].name).toBe(mockQueue[1].artists[0].name);
    expect(response[1].uri).toBe(mockQueue[1].uri);
  });

  it('throws an error when fetching queue fails', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Fetch queue failed'));
    await expect(getQueue()).rejects.toThrow('Fetch queue failed');
  });
});
