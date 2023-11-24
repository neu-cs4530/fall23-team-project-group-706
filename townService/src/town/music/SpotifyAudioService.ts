/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class SpotifyAudioService {
  public readonly _BASE_URL = 'https://api.spotify.com/v1';

  public readonly AUTH_URL = 'https://accounts.spotify.com/authorize';

  public readonly TOKEN_URL = 'https://accounts.spotify.com/api/token';

  private _clientId: string;

  private _clientSecret: string;

  private _redirectUri: string;

  private readonly _code: string = new URLSearchParams(window.location.search).get(
    'code',
  ) as string;

  constructor(clientId: string, clientSecret: string) {
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._redirectUri = 'https://localhost:3000/login';
  }

  private _generateRandomString(length: number): string {
    let text = '';
    const allALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += allALPHA.charAt(Math.floor(Math.random() * allALPHA.length));
    }
    return text;
  }

  // returns the auth url
  getAuthUrl(): string {
    const state = this._generateRandomString(16);
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
      state,
    });
    return `${this.AUTH_URL}?${queryParams}`;
  }

  // returns access token
  async getAccessToken(code: string): Promise<string> {
    if (!code) {
      document.location = this.getAuthUrl();
    }

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

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error obtaining access token:', error);
      throw error;
    }
  }

  // searches spotify for a single song and returns its uri
  async searchSongs(title: string): Promise<string> {
    const searchEndpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      title,
    )}&type=track&limit=1`;

    try {
      const response = await fetch(searchEndpoint, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken(this._code).toString()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.tracks.items.length === 0) {
        throw new Error('No tracks found for the given title');
      }

      return data.tracks.items[0].uri; // Return the URI of the first track
    } catch (error) {
      console.error('Error searching for track:', error);
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
