/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class MusicArea {
  isPLaying = false;

  message = '';

  currentTrackID: string | null = null;

  constructor(private _spotifyService: SpotifyAudioService) {}

  play(): void {
    if (this.currentTrackID) {
      this._spotifyService.playTrack(this.currentTrackID);
      this.isPLaying = true;
    } else {
      this.message = 'No current track loaded';
    }
  }

  pause(): void {
    throw new Error('Method not implemented.');
  }

  loadTrack(trackId: string): void {
    throw new Error('Method not implemented.');
  }

  seek(position: number): void {
    throw new Error('Method not implemented.');
  }
}
