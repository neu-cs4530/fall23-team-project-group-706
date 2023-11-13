/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicArea {
  isPLaying = false;

  message = '';

  currentTrackID: string | null = null;

  private _spotify: SpotifyAudioService;

  constructor(spotify: SpotifyAudioService) {
    this._spotify = spotify;
  }

  // using the authorization method in SpotifyAudioService for this to work
  join(): void {
    try {
      this._spotify.getAuthUrl();
    } catch (error) {
      this.message = `${(error as Error).message}`;
    }
  }

  search(songName: string): void {
    try {
      this._spotify.searchSongs(songName);
    } catch (error) {
      this.message = `${(error as Error).message}`;
    }
  }

  play(): void {
    if (this.currentTrackID) {
      this._spotify.playTrack(this.currentTrackID);
      this.isPLaying = true;
    } else {
      this.message = 'No current track loaded';
    }
  }

  // add a .catch
  pause(): void {
    this._spotify.pause().then(() => {
      this.isPLaying = false;
    });
  }
}
