import Interactable, { KnownInteractableTypes } from '../Interactable';
import { BoundingBox } from '../../../types/CoveyTownSocket';

export default class MusicAreaInteractble extends Interactable {
  private _isInteracting = false;

  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.setDepth(-1);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
  }


  public getBoundingBox(): BoundingBox {
    const { x, y, width, height } = this.getBounds();
    return { x, y, width, height };
  }

  overlapExit(): void {
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  interact(): void {
    this._isInteracting = true;
  }

  getType(): KnownInteractableTypes {
    return 'musicArea';
  }
}
