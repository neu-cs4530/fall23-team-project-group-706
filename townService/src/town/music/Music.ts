import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import { MusicAreaID, MusicInstanace, MusicState } from '../../types/CoveyTownSocket';

export default abstract class Music<StateType extends MusicState> {
  private _state: StateType;

  public readonly id: MusicAreaID;

  protected _players: Player[] = [];

  public constructor(state: StateType) {
    this.id = nanoid() as MusicAreaID;
    this._state = state;
  }

  public get state() {
    return this._state;
  }

  public set state(state: StateType) {
    this._state = state;
  }

  public abstract authorize(code: string): void;

  public abstract search(query: string, options: Promise<SpotifyApi.SearchResponse>): void;

  public abstract getCurrentTrackID(): string | null;

  public abstract addSongToQueue(songName: string): void;

  public abstract playSong(songUri: string): void;

  public abstract pauseSong(): void;

  public abstract skip(): void;

  public abstract back(): void;

  public abstract votingSong(songName: string): void;

  public toModel(): MusicInstanace<StateType> {
    return {
      state: this._state,
      id: this.id,
      players: this._players.map(player => player.id),
    };
  }
}
