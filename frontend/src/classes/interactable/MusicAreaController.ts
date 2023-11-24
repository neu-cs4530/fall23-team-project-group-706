import _, { map } from 'lodash';
import {
  InteractableID, MusicAreaID,
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
export default class MusicAreaController<
  EventTypes extends MusicEventTypes,
  > extends InteractableAreaController<EventTypes, MusicArea> {
  
  protected _townController: TownController;

  protected _model: MusicArea;

  protected _instanceID?: MusicAreaID;

  protected _players: PlayerController[] = [];

  protected _queue: string[] = [];

  protected _votingHistory: Map<string, number> = new Map<string, number>();


  constructor(id: InteractableID, musicArea: MusicArea, townController: TownController) {
    super(id);
    this._model = musicArea;
    this._townController = townController;

    if (musicArea.music && musicArea.queue) {
      this._queue = musicArea.queue;
    }

    if (musicArea.music && musicArea.music.voting) {
      this._votingHistory = musicArea.music.voting;
    }
  }

  public isActive(): boolean {
    return true;
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
  public async joinSession() {
    const { musicID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinMusic',
    });
    this._instanceID = musicID;
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
      type: "PlayMusic"
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
  protected _updateFrom(newModel: MusicArea): void {  
    const newSongs = newModel.queue ?? [];
    if (!_.isEqual(this.queue.length, newModel.queue.length) ||
    _.xor(newSongs, this._queue).length > 0) {
      this._queue = newSongs;
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('songAddedToQueue', newSongs)
    }
    if (!_.isEqual(newModel.music?.voting, this._votingHistory)) {
      this._votingHistory = newModel.music?.voting ?? new Map<string, number>();

      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('votingUpdated', newModel.voting)
    }
    this._model = newModel;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('musicUpdated');
  }

  toInteractableAreaModel(): MusicArea {
    return this._model;
  }
}
