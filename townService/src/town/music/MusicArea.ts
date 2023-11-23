import {
  MusicArea as MusicAreaModal,
  InteractableType,
  MusicState,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Music from './Music';

/**
 * A MusicArea is an InteractableArea on the map that can host a game.
 * At any given point in time, there is at most one game in progress in a MusicArea.
 */
export default abstract class MusicArea<
  MusicType extends Music<MusicState>,
> extends InteractableArea {
  protected _music?: MusicType;

  public get music(): MusicType | undefined {
    return this._music;
  }

  public toModel(): MusicAreaModal<MusicType['state']> {
    return {
      id: this.id,
      music: this._music?.toModel(),
      occupants: this.occupantsByID,
      type: this.getType(),
    };
  }

  public get isActive(): boolean {
    return true;
  }

  protected abstract getType(): InteractableType;
}
