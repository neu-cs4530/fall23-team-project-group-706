/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
class SpotifyAudioService {
  private readonly _BASE_URL = 'https://api.spotify.com/v1';

  private readonly AUTH_URL = 'https://accounts.spotify.com/authorize';

  private readonly TOKEN_URL = 'https://accounts.spotify.com/api/token';

  private _clientId: string;

  private _clientSecret: string;

  private _redirectUri: string;

  private readonly _code = new URLSearchParams(window.location.search).get('code');

  constructor(clientId: string, clientSecret: string) {
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._redirectUri = 'https://localhost:8000/login';
  }

  // returns the auth url
  getAuthUrl(): string {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-top-read',
    ];
    const scopeString = encodeURIComponent(scopes.join(' '));
    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: this._clientId,
      scope: scopeString,
    });
    return `${this.AUTH_URL}?${queryParams}`;
  }

  // returns access token
  async getAccessToken(code: string | null): Promise<string> {
    if (code) {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this._redirectUri,
        client_id: this._clientId,
        client_secret: this._clientSecret,
      });

      try {
        const response = await fetch(this.TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SpotifyTokenResponse = await response.json();
        return data.access_token;
      } catch (error) {
        console.error('Error obtaining access token:', error);
        throw error;
      }
    } else {
      throw new Error('something went wrong');
    }
  }

  // searches spotify for a single song and returns its uri
  async searchSongs(query: string, limit = 1, offset = 0): Promise<string> {
    const searchEndpoint = `${this._BASE_URL}/search`;
    const queryParams = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
      offset: offset.toString(),
    });

    try {
      const response = await fetch(`${searchEndpoint}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken(this._code).toString()}}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tracks.items[0].uri; // Return the URI of the first track
    } catch (error) {
      console.error('Error searching songs:', error);
      throw error;
    }
  }

  // unpauses or starts playing the music
  async playTrack(songURI: string): Promise<void> {
    const playEndpoint = `https://api.spotify.com/v1/me/player/play`;
    try {
      const response = await fetch(playEndpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken(this._code).toString()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [songURI] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }

  // pauses the music
  async pauseTrack(): Promise<void> {
    const pauseEndpoint = `${this._BASE_URL}/me/player/pause`;
    try {
      await fetch(pauseEndpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken(this._code).toString()}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Playback paused');
    } catch (error) {
      console.error('Error in pausing track:', error);
    }
  }
}
