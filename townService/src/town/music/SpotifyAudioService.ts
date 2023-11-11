/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
class SpotifyAudioService {
  private readonly _BASE_URL = 'https://api.spotify.com/v1';

  private readonly AUTH_URL = 'https://accounts.spotify.com/authorize';

  private readonly TOKEN_URL = 'https://accounts.spotify.com/api/token';

  private _accessToken: string;

  private _clientId: string;

  private _clientSecret: string;

  private _redirectUri: string;

  constructor(accessToken: string, clientId: string, clientSecret: string) {
    this._accessToken = accessToken;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._redirectUri = 'https://localhost:8000/login';
  }

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

  // I get the gist of this method but I honestly just took it straight from online
  // If you(Michael) understand it then perfect
  async getAccessToken(code: string): Promise<{ accessToken: string; refreshToken: string }> {
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
      return { accessToken: data.access_token, refreshToken: data.refresh_token };
    } catch (error) {
      console.error('Error obtaining access token:', error);
      throw error;
    }
  }

  async playTrack(trackId: string): Promise<void> {
    const playEndpoint = `${this._BASE_URL}/me/player/play`;
    try {
      await fetch(playEndpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this._accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
      });
      console.log(`Playing track with ID: ${trackId}`);
    } catch (error) {
      console.error('Error in playing track:', error);
    }
  }

  async pause(): Promise<void> {
    const pauseEndpoint = `${this._BASE_URL}/me/player/pause`;
    try {
      await fetch(pauseEndpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this._accessToken}`,
        },
      });
      console.log('Playback paused');
    } catch (error) {
      console.error('Error in pausing track:', error);
    }
  }
}
