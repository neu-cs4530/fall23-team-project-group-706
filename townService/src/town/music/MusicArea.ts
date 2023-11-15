import InvalidParametersError from '../../lib/InvalidParametersError';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  Player,
} from '../../types/CoveyTownSocket';

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

  // todo: handle command, see tictactoegamearea.ts
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {}

  // todo: do we need player?
  private _join(player: Player): void {
    try {
      this._spotify.getAuthUrl();
    } catch (error) {
      this.message = `${(error as Error).message}`;
    }
  }

  // todo: do we need player/this functions?
  private _leave(player: Player): void {}

  // finished: searches for a song based on name and returns uri
  private async _search(songName: string): Promise<string> {
    const resultURI = this._spotify.searchSongs(songName);
    return resultURI;
  }

  // finished: gets the current song's uri from the queue array
  private _getCurrentTrackID(): string {
    return this._qSong[this._currentSongIndex];
  }

  // finished: resume the player
  private _play(): void {
    this.isPLaying = true;
    this._spotify.playTrack(this._getCurrentTrackID());
  }

  // finished: pause the player
  private _pause(): void {
    this.isPLaying = false;
    this._spotify.pauseTrack();
  }

  // finished: skip to next song in queue, updates index
  // loops around if end of queue
  // errors if queue empty
  private _skip(): void {
    if (this._qSong.length === 0) {
      throw new InvalidParametersError('No song in queue');
    }
    this._currentSongIndex++;
    this._currentSongIndex %= this._qSong.length;
    this._spotify.playTrack(this._getCurrentTrackID()).then(() => {});
  }

  // finished: skip to previous song in queue, updates index
  // loops around if beginning of queue
  // errors if queue empty
  private _back(): void {
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
  // starts playing the song if the queue was previously empty
  private async _addToQueue(songName: string): Promise<void> {
    this._qSong.push(await this._search(songName));
    this._currentSongIndex++;
    if (this._qSong.length === 1) {
      this._play();
    }
  }
}
