import { nanoid } from 'nanoid';
import InvalidParametersError from '../../lib/InvalidParametersError';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  MusicAreaID,
  MusicStatus,
  Player,
} from '../../types/CoveyTownSocket';

/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicArea {
  public readonly id: MusicAreaID;

  public status: MusicStatus;

  // private _isPlaying = false;

  private _message = '';

  private _spotify: SpotifyAudioService;

  private _qSong: string[] = [];

  private _players: Player[] = [];

  private _voting: Map<string, number> = new Map();

  private _currentSongIndex = 0;

  constructor(spotify: SpotifyAudioService) {
    this.id = nanoid() as MusicAreaID;
    this._spotify = spotify;
    this.status = 'NOT_STARTED_PLAYING';
  }

  // get paused(): boolean {
  //   return !this._isPlaying;
  // }

  // get playing(): boolean {
  //   return this.paused;
  // }

  public get votingHist(): Map<string, number> {
    return this._voting;
  }

  public get queue(): string[] {
    return this._qSong;
  }

  public get currentIndex(): number {
    return this._currentSongIndex;
  }

  protected getType(): InteractableType {
    return 'MusicArea';
  }

  // todo: handle command, see tictactoegamearea.ts
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // something like this
    if (command.type === 'JoinMusic') {
      this.join(player);
      return { musicID: this.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'PlayMusic') {
      this.play();
    } else if (command.type === 'AddToQueue') {
      this.addToQueue(command.song);
    } else if (command.type === 'SearchSong') {
      this.search(command.song);
    } else if (command.type === 'SkipSong') {
      this.skip();
    } else if (command.type === 'PreviousSong') {
      this.back();
    } else if (command.type === 'PauseMuisc') {
      this.pause();
    } else if (command.type === 'VoteSong') {
      this.voting(command.song);
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }

  // todo: do we need player?
  // to display which players are there then yes, just created a player array to add players
  public join(player: Player): void {
    if (this.status === 'NOT_STARTED_PLAYING') {
      try {
        this._spotify.getAuthUrl();
      } catch (error) {
        this._message = `${(error as Error).message}`;
      }
      this._players.push(player);
      this.status = 'CAN_START_PLAYING';
    }
  }

  // finished: searches for a song based on name and returns uri
  public async search(songName: string): Promise<string> {
    const resultURI = this._spotify.searchSongs(songName);
    return resultURI;
  }

  // finished: gets the current song's name from the queue array
  public getCurrentTrackID(): string {
    return this._qSong[this._currentSongIndex];
  }

  // finished: resume the player
  public play(): void {
    // this._isPlaying = true;
    if (this.status !== 'NOT_STARTED_PLAYING') {
      this._spotify.playTrack(this.getCurrentTrackID());
      this.status = 'PLAYING';
    }
  }

  // finished: pause the player
  public pause(): void {
    // this._isPlaying = false;

    if (this.status === 'PLAYING') {
      this._spotify.pauseTrack();
      this.status = 'PAUSED';
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
    this._spotify.playTrack(this.getCurrentTrackID());
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
    this._spotify.playTrack(this.getCurrentTrackID());
  }

  public voting(songName: string): void {
    let playCount = this._voting.get(songName) || 0;
    playCount++;
    this._voting.set(songName, playCount);
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
