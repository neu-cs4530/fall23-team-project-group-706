/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicArea {
  isPLaying = false;

  message = '';

  currentTrackID: string | null = null;

  constructor(private _spotifyService: SpotifyAudioService) {}

  // using the authorization method in SpotifyAudioService for this to work
  join(): void {}

  play(): void {
    if (this.currentTrackID) {
      this._spotifyService.playTrack(this.currentTrackID);
      this.isPLaying = true;
    } else {
      this.message = 'No current track loaded';
    }
  }

  // add a .catch
  pause(): void {
    this._spotifyService.pause().then(() => {
      this.isPLaying = false;
    });
  }
}
