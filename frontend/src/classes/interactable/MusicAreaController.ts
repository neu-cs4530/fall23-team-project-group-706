import _ from 'lodash';
import {
  InteractableID,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import { MusicArea as MusicAreaModel } from '../../types/CoveyTownSocket';

export type MusicEventTypes = BaseInteractableEventMap & {
  // gameStart: () => void;
  // gameUpdated: () => void;
  // gameEnd: () => void;
  // playersChange: (newPlayers: PlayerController[]) => void;
};

/**
 * This class is the base class for all game controllers. It is responsible for managing the
 * state of the game, and for sending commands to the server to update the state of the game.
 * It is also responsible for notifying the UI when the state of the game changes, by emitting events.
 */
export default abstract class MusicAreaController<
  EventTypes extends MusicEventTypes,
  > extends InteractableAreaController<EventTypes, MusicAreaModel> {
  protected _players: PlayerController[] = [];

  protected _townController: TownController;

  protected _model: MusicAreaModel;

  protected _instanceID?: string;

  constructor(id: InteractableID, MusicArea: MusicAreaModel, townController: TownController) {
    super(id);
    this._model = MusicArea;
    this._townController = townController;
  }

  get players(): PlayerController[] {
    return this._players;
  }

  public get observers(): PlayerController[] {
    return this.occupants.filter(eachOccupant => !this._players.includes(eachOccupant));
  }

  /**
   * Sends a request to the server to join the current listening session in the music area, or create a new one if there is no queue in progress.
   *
   * @throws An error if the server rejects the request to join the session.
   */
  public async joinSession() {
    // const { gameID } = await this._townController.sendInteractableCommand(this.id, {
    //   type: 'JoinGame',
    // });
    // this._instanceID = gameID;
  }

  /**
   * Sends a request to the server to leave the current music session in the game area.
   */
  public async leaveSession() {
    // const instanceID = this._instanceID;
    // if (instanceID) {
    //   await this._townController.sendInteractableCommand(this.id, {
      
    //   });
    // }
  }

  protected _updateFrom(newModel: MusicAreaModel): void {
    
  }

  toInteractableAreaModel(): MusicAreaModel {
    return this._model;
  }
}
