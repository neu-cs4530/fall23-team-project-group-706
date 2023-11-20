import {
  MusicArea as MusicAreaModal,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';
import InteractableArea from '../InteractableArea';
import MusicAreaImpl from './MusicAreaImpl';

/**
 * A MusicArea is an InteractableArea on the map that can host a game.
 * At any given point in time, there is at most one game in progress in a MusicArea.
 */
export default abstract class MusicArea extends InteractableArea {
  protected _music?: MusicAreaImpl = new MusicAreaImpl();

  protected _queue: string[] = [];

  public get music(): MusicAreaImpl | undefined {
    return this._music;
  }

  public get historyQueue(): string[] {
    return this._queue;
  }

  public toModel(): MusicAreaModal {
    return {
      id: this.id,
      music: this._music?.toModel(),
      queue: this._queue,
      occupants: this.occupantsByID,
      type: this.getType(),
    };
  }

  public get isActive(): boolean {
    return true;
  }

  protected getType(): InteractableType {
    return 'MusicArea';
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // something like this
    if (command.type === 'JoinMusic') {
      let music = this._music;
      if (!music) {
        music = new MusicAreaImpl();
        this._music = music;
      }
      this._music?.join();
      // return { musicID: this.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'PlayMusic') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.play();
    } else if (command.type === 'AddToQueue') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.addToQueue(command.song);
    } else if (command.type === 'SearchSong') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.search(command.song);
    } else if (command.type === 'SkipSong') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.skip();
    } else if (command.type === 'PreviousSong') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.back();
    } else if (command.type === 'PauseMuisc') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.pause();
    } else if (command.type === 'VoteSong') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.votingSong(command.song);
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }
}
