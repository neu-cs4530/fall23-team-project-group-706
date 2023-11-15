/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicArea {
  isPLaying = false;

  message = '';

  private _qSong: string[] = [];

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
      // this._spotify.searchSongs(songName);
      this._spotify.searchTrackByTitle(songName);
    } catch (error) {
      this.message = `${(error as Error).message}`;
    }
  }

  play(): void {
    if (this.currentTrackID) {
      this._spotify
        .playTrack(this.currentTrackID)
        .then(() => {
          this.isPLaying = false;
        })
        .catch(error => (this.message = `${(error as Error).message}`));
    } else {
      this.message = 'No current track loaded';
    }
  }

  pause(): void {
    if (this.isPLaying) {
      this._spotify
        .pauseTrack()
        .then(() => {
          this.isPLaying = false;
        })
        .catch(error => (this.message = `${(error as Error).message}`));
    } else {
      this.message = 'Song had been paused already';
    }
  }
}
