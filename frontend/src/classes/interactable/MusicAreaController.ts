import _, { map } from 'lodash';
import {
  InteractableID, MusicAreaID, MusicState,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import { MusicArea} from '../../types/CoveyTownSocket';


export type MusicEventTypes = BaseInteractableEventMap & {
  songAddedToQueue: (queue: string[]) => void;
  musicUpdated: () => void;
  votingUpdated: (votingHist: Map<string, number>) => void;
};

/**
 * This class is the base class for all game controllers. It is responsible for managing the
 * state of the game, and for sending commands to the server to update the state of the game.
 * It is also responsible for notifying the UI when the state of the game changes, by emitting events.
 */
export default abstract class MusicAreaController<
  State extends MusicState,
  EventTypes extends MusicEventTypes,
  > extends InteractableAreaController<EventTypes, MusicArea<State>> {
  
  protected _townController: TownController;

  protected _model: MusicArea<State>;

  protected _instanceID?: MusicAreaID;

  protected _players: PlayerController[] = [];

  protected _queue: string[] = [];

  protected _votingHistory: Map<string, number> = new Map<string, number>();


  constructor(id: InteractableID, musicArea: MusicArea<State>, townController: TownController) {
    super(id);
    this._model = musicArea;
    this._townController = townController;

    if (musicArea.music && musicArea.music.state.queue) {
      this._queue = musicArea.music.state.queue;
    }

    if (musicArea.music && musicArea.music.state.voting) {
      this._votingHistory = musicArea.music.state.voting;
    }
  }

  get players(): PlayerController[] {
    return this._players;
  }

  get queue(): string[] {
    return this._queue;
  }

  get votingHistory(): Map<string, number> {
    return this._votingHistory;
  }


  /**
   * Sends a request to the server to join the current listening session in the music area, or create a new one if there is no queue in progress.
   * @throws An error if the server rejects the request to join the session.
   */
  public async joinSession(code: string) {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinMusic',
      code: code,
    });
  }

  /**
   *
   * Allows a user to pause any music in the current music session in the game area.
   */
  public async pauseMusic() {
    await this._townController.sendInteractableCommand(this.id,{
      type: "PauseMuisc"
    })
  }
  /**
   *
   * Allows a user to play any music in the current music session in the game area.
   */

  public async playMusic() {
    await this._townController.sendInteractableCommand(this.id, {
      type: "PlayMusic",
      song: 'song'
    })
  }

  /**
   *
   * Allows a user to skip any music in the current music session in the game area.
   */

  public async skipForward() {
    await this._townController.sendInteractableCommand(this.id, {
      type: "SkipSong"
    })
  }

  /**
   *
   * Allows a user to skip back to any music in the current music session in the game area.
   */

  public async skipBackward() {
    await this._townController.sendInteractableCommand(this.id, {
      type: "PreviousSong"
    })
  }

  /**
   *
   * Allows a user to add any music in the current music session in the game area.
   */

  public async addToQueue(song: string) {
    await this._townController.sendInteractableCommand(this.id, {
      type: "AddToQueue",
      song: song
    })
  }
  
  // add the emit for updating the players in there
  protected _updateFrom(newModel: MusicArea<State>): void {  
    const newSongs = newModel.music?.state.queue ?? [];
    if (!_.isEqual(this.queue.length, newModel.music?.state.queue.length) ||
    _.xor(newSongs, this._queue).length > 0) {
      this._queue = newSongs;
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('songAddedToQueue', newSongs)
    }
    if (!_.isEqual(newModel.music?.state.voting, this._votingHistory)) {
      this._votingHistory = newModel.music?.state.voting ?? new Map<string, number>();

      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('votingUpdated', newModel.voting)
    }
    this._model = newModel;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('musicUpdated');
  }

  toInteractableAreaModel(): MusicArea<State> {
    return this._model;
  }
}
