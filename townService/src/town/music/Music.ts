import InvalidParametersError from '../../lib/InvalidParametersError';

/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicArea {
  // for play/pause
  isPLaying = false;

  message = '';

  // our spotify connection
  private _spotify: SpotifyAudioService;

  // queue of song URIs
  private _qSong: string[] = [];

  // index to track currently playing song
  private _currentSongIndex = 0;

  // initialize with spotify connection
  constructor(spotify: SpotifyAudioService) {
    this._spotify = spotify;
  }

  // todo:
  join(): void {
    try {
      this._spotify.getAuthUrl();
    } catch (error) {
      this.message = `${(error as Error).message}`;
    }
  }

  // todo:
  leave(): void {}

  // todo:
  search(songName: string): string {
    try {
      // how do we save/return this result?
      // will this give us an ID or what?
      // what's the difference between track ID/song ID?
      this._spotify.searchSongs(songName);
    } catch (error) {
      this.message = `${(error as Error).message}`;
    }
  }

  // finished: gets the current song's uri from the queue array
  private _getCurrentTrackID(): string {
    return this._qSong[this._currentSongIndex];
  }

  // todo:
  play(): void {
    const songToPlay = this._getCurrentTrackID();
    if (songToPlay != null) {
      this._spotify.playTrack(songToPlay);
      this.isPLaying = true;
    } else {
      this.message = 'No current track loaded';
    }
  }

  // todo:
  pause(): void {
    this._spotify.pauseTrack().then(() => {
      this.isPLaying = false;
      this._spotify.pauseTrack();
    });
  }

  // finished: skip to next song in queue, updates index
  // loops around if end of queue
  // errors if queue empty
  skip(): void {
    if (this._qSong.length === 0) {
      throw new InvalidParametersError('No song in queue');
    }
    this._currentSongIndex++;
    this._currentSongIndex %= this._qSong.length;
    this._spotify.playTrack(this._getCurrentTrackID());
  }

  // finished: skip to previous song in queue, updates index
  // loops around if beginning of queue
  // errors if queue empty
  back(): void {
    if (this._qSong.length === 0) {
      throw new InvalidParametersError('No song in queue');
    }
    if (this._currentSongIndex > 0) {
      this._currentSongIndex--;
    } else {
      this._currentSongIndex = this._qSong.length - 1;
    }
    this._spotify.playTrack(this._getCurrentTrackID());
  }

  // finished: add to queue based on song name search, updates index
  addToQueue(songName: string): void {
    this._qSong.push(this.search(songName));
    this._currentSongIndex++;
  }
}
