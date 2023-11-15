/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicArea {
  isPLaying = false;

  message = '';

<<<<<<< HEAD
=======
  private _qSong: string[] = [];

  currentTrackID: string | null = null;

>>>>>>> fbca9069a7d063808d2d1f19872fc34218a73a65
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
<<<<<<< HEAD
      // how do we save/return this result?
      // will this give us an ID or what?
      // what's the difference between track ID/song ID?
      this._spotify.searchSongs(songName);
=======
      // this._spotify.searchSongs(songName);
      this._spotify.searchTrackByTitle(songName);
>>>>>>> fbca9069a7d063808d2d1f19872fc34218a73a65
    } catch (error) {
      this.message = `${(error as Error).message}`;
    }
  }

  private _getCurrentTrackID(): string | null {
    return this._qSong[this._currentSongIndex];
  }

  play(): void {
<<<<<<< HEAD
    const songToPlay = this._getCurrentTrackID();
    if (songToPlay != null) {
      this._spotify.playTrack(songToPlay);
      this.isPLaying = true;
=======
    if (this.currentTrackID) {
      this._spotify
        .playTrack(this.currentTrackID)
        .then(() => {
          this.isPLaying = false;
        })
        .catch(error => (this.message = `${(error as Error).message}`));
>>>>>>> fbca9069a7d063808d2d1f19872fc34218a73a65
    } else {
      this.message = 'No current track loaded';
    }
  }

  pause(): void {
<<<<<<< HEAD
    this._spotify.pause().then(() => {
      this.isPLaying = false;
      this._spotify.pause();
    });
=======
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
>>>>>>> fbca9069a7d063808d2d1f19872fc34218a73a65
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
