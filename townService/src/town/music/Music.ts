import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import { MusicAreaID, MusicInstanace, MusicState } from '../../types/CoveyTownSocket';

export default abstract class Music {
  private _state: MusicState;

  public readonly id: MusicAreaID;

  private _voting: Map<string, number> = new Map();

  protected _players: Player[] = [];

  public constructor(state: MusicState) {
    this.id = nanoid() as MusicAreaID;
    this._state = state;
  }

  /**
   * getting the voting
   */
  public get voting(): Map<string, number> {
    return this._voting;
  }

  public get state() {
    return this._state;
  }

  public set state(state: MusicState) {
    this._state = state;
  }

  protected abstract join(player: Player): void;

  protected abstract search(songName: string): Promise<string>;

  protected abstract getCurrentTrackID(): string;

  protected abstract play(): void;

  protected abstract pause(): void;

  protected abstract skip(): void;

  protected abstract back(): void;

  protected abstract votingSong(songName: string): void;

  public toModel(): MusicInstanace {
    return {
      state: this._state,
      id: this.id,
      voting: this.voting,
      players: this._players.map(player => player.id),
    };
  }
}
