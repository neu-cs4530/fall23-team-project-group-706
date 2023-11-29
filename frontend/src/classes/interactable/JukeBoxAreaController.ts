import _, { map } from 'lodash';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import { JukeBoxAreaInteractable} from '../../types/CoveyTownSocket';
import { InteractableID } from '../../generated/client/models/InteractableID';
import TownController from '../TownController';


export type MusicEventTypes = BaseInteractableEventMap & {
  songAddedToQueue: (queue: string[]) => void;
  votingUpdated: (votingHist: Map<string, number>) => void;
};

/**
 * This class is the base class for all JukeBox controllers. It is responsible for managing the
 * state of the JukeBox, and for sending commands to the server to update the state of the Jukebox.
 * It is also responsible for notifying the UI when the state of the JukeBox changes, by emitting events.
 */
export default class JukeBoxAreaController extends InteractableAreaController<MusicEventTypes, JukeBoxAreaInteractable> {
  
  protected _model: JukeBoxAreaInteractable;

  protected _townController: TownController;

  constructor(id: InteractableID, musicArea: JukeBoxAreaInteractable, townController: TownController) {
    super(id);
    this._model = musicArea;
    this._townController = townController;
  }

  public isActive(): boolean {
    return true;
  }

  get isPlaying(): boolean {
    return this._model.isPlaying;
  }

  get queue(): string[] {
    return this._model.queue;
  }

  get votingHistory(): Map<string, number> {
    return this._model.voting;
  }
  
  // add the emit for updating the queue and voting history in here
  protected _updateFrom(newModel: JukeBoxAreaInteractable): void {  
    if (newModel.isPlaying != this.isPlaying) {
      this._model.isPlaying = newModel.isPlaying;
    }
    const newSongs = newModel.queue ?? [];
    if (!_.isEqual(this.queue.length, newModel.queue.length) ||
    _.xor(newSongs, this._model.queue).length > 0) {
      this._model.queue = newSongs;
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('songAddedToQueue', newSongs)
    }
    if (!_.isEqual(newModel.voting, this._model.voting)) {
      this._model.voting = newModel.voting ?? new Map<string, number>();

      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('votingUpdated', newModel.voting)
    }
    this._model = newModel;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('musicUpdated');
  }

  toInteractableAreaModel(): JukeBoxAreaInteractable {
    return this._model;
  }
}
