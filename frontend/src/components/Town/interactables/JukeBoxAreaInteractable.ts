import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class JukeBoxAreaInteractable extends Interactable {
  private _isInteracting = false;

  private _labelText?: Phaser.GameObjects.Text;

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
    this._labelText = this.scene.add
      .text(
        this.x - this.displayWidth / 2,
        this.y - this.displayHeight / 2,
        `Press space to open the jukebox!!!`,
        { color: '#FFFFFF', backgroundColor: '#000000' },
      )
      .setDepth(30);
    this._labelText.setVisible(false);
  }

  overlapExit(): void {
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
    this._labelText?.setVisible(false);
  }

  overlap(): void {
    if (!this._labelText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
    this._labelText.setX(location.x);
    this._labelText.setY(location.y);
    this._labelText.setVisible(true);
  }

  interact(): void {
    this._labelText?.setVisible(false);
    this._isInteracting = true;
  }

  getType(): KnownInteractableTypes {
    return 'jukeBoxArea';
  }
}
