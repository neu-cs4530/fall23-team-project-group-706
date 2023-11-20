import InvalidParametersError from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import Music from './Music';
import SpotifyAudioService from './SpotifyAudioService';

/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicAreaImpl extends Music {
  private _qSong: string[] = [];

  private _currentSongIndex = 0;

  constructor() {
    super({
      status: 'NOT_STARTED_PLAYING',
      service: new SpotifyAudioService(),
    });
  }

  public get queue(): string[] {
    return this._qSong;
  }

  public get currentIndex(): number {
    return this._currentSongIndex;
  }

  // todo: do we need player?
  // to display which players are there then yes, just created a player array to add players
  public join(): void {
    try {
      this.state.service.getAuthUrl();
    } catch (error) {
      throw new Error(`${(error as Error).message}`);
    }
    this.state.status = 'CAN_START_PLAYING';

    // super._players.push(player);
  }

  // finished: searches for a song based on name and returns uri
  public async search(songName: string): Promise<string> {
    const resultURI = this.state.service.searchSongs(songName);
    return resultURI;
  }

  // finished: gets the current song's name from the queue array
  public getCurrentTrackID(): string {
    return this._qSong[this._currentSongIndex];
  }

  // finished: resume the player
  public play(): void {
    // this._isPlaying = true;
    if (this.state.status !== 'NOT_STARTED_PLAYING') {
      this.state.service.playTrack(this.getCurrentTrackID());
      this.state.status = 'PLAYING';
    }
  }

  // finished: pause the player
  public pause(): void {
    // this._isPlaying = false;

    if (this.state.status === 'PLAYING') {
      this.state.service.pauseTrack();
      this.state.status = 'PAUSED';
    }
  }

  // finished: skip to next song in queue, updates index
  // loops around if end of queue
  // errors if queue empty
  public skip(): void {
    if (this._qSong.length === 0) {
      throw new InvalidParametersError('No song in queue');
    }
    this._currentSongIndex++;
    this._currentSongIndex %= this._qSong.length;
    this.state.service.playTrack(this.getCurrentTrackID());
  }

  // finished: skip to previous song in queue, updates index
  // loops around if beginning of queue
  // errors if queue empty
  public back(): void {
    if (this._qSong.length === 0) {
      throw new InvalidParametersError('No song in queue');
    }
    if (this._currentSongIndex > 0) {
      this._currentSongIndex--;
    } else {
      this._currentSongIndex = this._qSong.length - 1;
    }
    this.state.service.playTrack(this.getCurrentTrackID());
  }

  public votingSong(songName: string): void {
    let playCount = this.voting.get(songName) || 0;
    playCount++;
    this.voting.set(songName, playCount);
  }

  // finished: add to queue based on song name search, updates index
  // starts playing the song if the queue was previously empty
  public async addToQueue(songName: string): Promise<void> {
    this._qSong.push(await this.search(songName));
    this._currentSongIndex++;
    if (this._qSong.length === 1) {
      this.play();
    }
  }
}
