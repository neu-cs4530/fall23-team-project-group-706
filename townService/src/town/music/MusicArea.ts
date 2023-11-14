/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicArea {
  isPLaying = false;

  message = '';

  private _spotify: SpotifyAudioService;

  private _qSong: string[] = [];

  private _currentSongIndex = 0;

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

  leave(): void {}

  search(songName: string): string {
    try {
      // how do we save/return this result?
      // will this give us an ID or what?
      this._spotify.searchSongs(songName);
    } catch (error) {
      this.message = `${(error as Error).message}`;
    }
  }

  private _getCurrentTrackID(): string | null {
    return this._qSong[this._currentSongIndex];
  }

  play(): void {
    const songToPlay = this._getCurrentTrackID();
    if (songToPlay != null) {
      this._spotify.playTrack(songToPlay);
      this.isPLaying = true;
    } else {
      this.message = 'No current track loaded';
    }
  }

  // add a .catch
  pause(): void {
    this._spotify.pause().then(() => {
      this.isPLaying = false;
      this._spotify.pause();
    });
  }

  skip(): void {
    this._currentSongIndex++;
  }

  back(): void {
    if (this._currentSongIndex > 0) {
      this._currentSongIndex--;
    } else {
      this.message = 'Cannot go back';
    }
  }

  addToQueue(songName: string): void {
    this._qSong.push(this.search(songName));
    this._currentSongIndex++;
  }
}
