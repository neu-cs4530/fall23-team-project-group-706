/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="spotify-api" />
import dotenv from 'dotenv';
import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  MusicArea as MusicAreaModel,
  InteractableID,
  MusicAreaUpdatedCommand,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

dotenv.config();

export default class JukeBoxMusicArea extends InteractableArea {
  public isPlaying: boolean;

  public queue: string[];

  public voting: Map<string, number>;

  public constructor(
    { id, isPlaying, queue, voting }: Omit<MusicAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.isPlaying = isPlaying;
    this.queue = queue;
    this.voting = voting;
  }

  public toModel(): MusicAreaModel {
    return {
      id: this.id,
      isPlaying: this.isPlaying,
      queue: this.queue,
      voting: this.voting,
      occupants: this.occupantsByID,
      type: 'JukeBoxMusicArea',
    };
  }

  /**
   * Updates the state of this MusicArea, setting the queue, isPlaying and voting properties
   *
   * @param musicArea updated model
   */
  public updateModel({ isPlaying, queue, voting }: MusicAreaModel) {
    this.queue = queue;
    this.isPlaying = isPlaying;
    this.voting = voting;
  }

  public votingSong(songName: string): void {
    const currentVotes = this.voting.get(songName) || 0;
    this.voting.set(songName, currentVotes + 1);
  }

  public getVotesForSong(songId: string): number {
    return this.voting.get(songId) || 0;
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'MusicAreaUpdate') {
      const musicArea = command as MusicAreaUpdatedCommand;
      this.updateModel(musicArea.update);
      return {} as InteractableCommandReturnType<CommandType>;
    }
    throw new Error('Method not implemented.');
  }

  /**
   * Creates a new JukeBoxMusicArea object that will represent a Viewing Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    townEmitter: TownEmitter,
  ): JukeBoxMusicArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed music area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    const musicType = mapObject.properties?.find(prop => prop.name === 'type')?.value;

    if (musicType === 'JukeBox') {
      return new JukeBoxMusicArea(
        {
          isPlaying: false,
          id: name as InteractableID,
          queue: [],
          voting: new Map<string, number>(),
          occupants: [],
        },
        rect,
        townEmitter,
      );
    }
    throw new Error(`Unknown game area type ${mapObject.class}`);
  }
}

// // authorization
// public async authorizeUser(code: string) {
//   this.spotifyApi.authorizationCodeGrant(
//     code,
//     (err: Error, data: AuthorizationCodeGrantResponse) => {
//       if (err) {
//         console.error('Something went wrong when retrieving the access token!', err);
//         return;
//       }
//       this.spotifyApi.setAccessToken(data.body.access_token);
//       this.spotifyApi.setRefreshToken(data.body.refresh_token);
//     },
//   );
// }

// // search for a song in Spotify
// public async searchSongs(query: string): Promise<SpotifyApi.TrackObjectFull[]> {
//   try {
//     const data = await this.spotifyApi.searchTracks(query);
//     if (data.body.tracks && data.body.tracks.items) {
//       return data.body.tracks.items;
//     }
//     return [];
//   } catch (error) {
//     console.error('Error searching songs:', error);
//     throw error;
//   }
// }

// public getCurrentTrackID(): string | null {
//   return this.queue[this._currentSongIndex];
// }

// public get currentIndex(): number {
//   return this._currentSongIndex;
// }

// // play a song
// public static async playSong(songUri: string): Promise<void> {
//   try {
//     await this.spotifyApi.play({ uris: [songUri] });
//   } catch (error) {
//     console.error('Error playing song:', error);
//     throw error;
//   }
//   this.isPlaying = true;
// }

// // Pause the currently playing song
// public static async pauseSong(): Promise<void> {
//   try {
//     await this.spotifyApi.pause();
//   } catch (error) {
//     console.error('Error pausing song:', error);
//     throw error;
//   }
//   this.isPlaying = false;
// }

// // Added songs to Queue
// public static async addSongToQueue(songUri: string): Promise<void> {
//   try {
//     await this.spotifyApi.addToQueue(songUri);
//     this.queue.push(songUri);
//   } catch (error) {
//     console.error('Error adding song to queue:', error);
//     throw error;
//   }
// }

// // can skip songs in queue
// public static async skip(): Promise<void> {
//   try {
//     await this.spotifyApi.skipToNext();
//     await this._updateCurrentTrack();
//   } catch (error) {
//     console.error('Error skipping to next song:', error);
//     throw error;
//   }
// }

// // get the updated version of the track
// private async _updateCurrentTrack(): Promise<void> {
//   try {
//     const data = await this.spotifyApi.getMyCurrentPlayingTrack();
//     if (data.body && data.body.item) {
//       this.queue[this._currentSongIndex] = data.body.item.id;
//     }
//   } catch (error) {
//     console.error('Error updating current track:', error);
//     throw error;
//   }
// }

// public getCurrentTrack(): Promise<void> {
//   return this._updateCurrentTrack();
// }

// public async back(): Promise<void> {
//   try {
//     await this.spotifyApi.skipToPrevious();
//     await this._updateCurrentTrack();
//   } catch (error) {
//     console.error('Error going back to previous song:', error);
//     throw error;
//   }
// }
