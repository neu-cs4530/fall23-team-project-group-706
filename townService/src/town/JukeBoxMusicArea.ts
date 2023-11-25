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
  JukeBoxAreaInteractable as MusicAreaModel,
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
      type: 'JukeBoxArea',
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

    if (musicType === 'JukeBoxMusic') {
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
