/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="spotify-api" />
import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';
import {
  AuthorizationCodeGrantResponse,
  ISpotifyService,
  MusicState,
} from '../../types/CoveyTownSocket';
import Music from './Music';

dotenv.config();

export default class JukeBoxMusic extends Music<MusicState> implements ISpotifyService {
  public spotifyApi: SpotifyWebApi;

  private _currentSongIndex = 0;

  public constructor() {
    super({
      status: false,
      queue: [],
      voting: new Map<string, number>(),
    });
    this.spotifyApi = new SpotifyWebApi({
      clientId: 'c7352d2289f4409c8f20675c19846d05', // process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: '4d4a02b8ee564d33963088f2a9a5cbb2', // process.env.SPOTIFY_CLIENT_SECRET || '',
      redirectUri: 'http://localhost:3000',
    });
  }

  // authorization
  public async authorize(code: string) {
    this.spotifyApi.authorizationCodeGrant(
      code,
      (err: Error, data: AuthorizationCodeGrantResponse) => {
        if (err) {
          console.error('Something went wrong when retrieving the access token!', err);
          return;
        }
        this.spotifyApi.setAccessToken(data.body.access_token);
        this.spotifyApi.setRefreshToken(data.body.refresh_token);
      },
    );
  }

  // search for a song in Spotify
  public async search(query: string): Promise<SpotifyApi.SearchResponse> {
    try {
      const data = await this.spotifyApi.searchTracks(query);
      return data.body;
    } catch (error) {
      throw new Error('Error occurred during song search');
    }
  }

  public getCurrentTrackID(): string | null {
    return this.state.queue[this._currentSongIndex];
  }

  public get currentIndex(): number {
    return this._currentSongIndex;
  }

  // play a song
  public async playSong(songUri: string): Promise<void> {
    try {
      await this.spotifyApi.play({ uris: [songUri] });
    } catch (error) {
      console.error('Error playing song:', error);
      throw error;
    }
    this.state.status = true;
  }

  // Pause the currently playing song
  public async pauseSong(): Promise<void> {
    try {
      await this.spotifyApi.pause();
    } catch (error) {
      console.error('Error pausing song:', error);
      throw error;
    }
    this.state.status = false;
  }

  // Added songs to Queue
  public async addSongToQueue(songUri: string): Promise<void> {
    try {
      await this.spotifyApi.addToQueue(songUri);
      this.state.queue.push(songUri);
    } catch (error) {
      console.error('Error adding song to queue:', error);
      throw error;
    }
  }

  // can skip songs in queue
  public async skip(): Promise<void> {
    try {
      await this.spotifyApi.skipToNext();
      await this._updateCurrentTrack();
    } catch (error) {
      console.error('Error skipping to next song:', error);
      throw error;
    }
  }

  // get the updated version of the track
  private async _updateCurrentTrack(): Promise<void> {
    try {
      const data = await this.spotifyApi.getMyCurrentPlayingTrack();
      if (data.body && data.body.item) {
        this.state.queue[this._currentSongIndex] = data.body.item.id;
      }
    } catch (error) {
      console.error('Error updating current track:', error);
      throw error;
    }
  }

  public getCurrentTrack(): Promise<void> {
    return this._updateCurrentTrack();
  }

  public async back(): Promise<void> {
    try {
      await this.spotifyApi.skipToPrevious();
      await this._updateCurrentTrack();
    } catch (error) {
      console.error('Error going back to previous song:', error);
      throw error;
    }
  }

  public votingSong(songName: string): void {
    const currentVotes = this.state.voting.get(songName) || 0;
    this.state.voting.set(songName, currentVotes + 1);
  }

  public getVotesForSong(songId: string): number {
    return this.state.voting.get(songId) || 0;
  }
}
