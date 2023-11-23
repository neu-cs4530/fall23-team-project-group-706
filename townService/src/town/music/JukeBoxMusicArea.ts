import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableType,
  InteractableCommand,
  InteractableCommandReturnType,
  MusicInstanace,
  MusicState,
} from '../../types/CoveyTownSocket';
import JukeBoxMusic from './JukeBoxMusic';
import MusicArea from './MusicArea';

export default class JukeBoxMusicArea extends MusicArea<JukeBoxMusic> {
  protected getType(): InteractableType {
    return 'JukeBoxArea';
  }

  private _stateUpdated(updatedState: MusicInstanace<MusicState>) {
    this._emitAreaChanged();
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // if (command.type === 'JoinMusic') {
    //   let music = this._music;
    //   if (!music) {
    //     music = new JukeBoxMusic();
    //     this._music = music;
    //   }
    //   this._music?.join(command.code, player);
    //   this._stateUpdated(music.toModel());
    //   return { gameID: music.id } as InteractableCommandReturnType<CommandType>;
    // }
    if (command.type === 'PlayMusic') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.playSong(command.song);
      this._stateUpdated(music.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'AddToQueue') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.addSongToQueue(command.song);
      this._stateUpdated(music.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SearchSong') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.search(command.song);
      this._stateUpdated(music.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SkipSong') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.skip();
      this._stateUpdated(music.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'PreviousSong') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.back();
      this._stateUpdated(music.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'PauseMuisc') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.pauseSong();
      this._stateUpdated(music.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'VoteSong') {
      const music = this._music;
      if (!music) {
        throw new Error('ewfewrfer');
      }
      music.votingSong(command.song);
      this._stateUpdated(music.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
