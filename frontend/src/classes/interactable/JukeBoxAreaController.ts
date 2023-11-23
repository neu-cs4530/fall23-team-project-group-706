import { MusicState } from "../../types/CoveyTownSocket";
import MusicAreaController, { MusicEventTypes } from "./MusicAreaController";

export default class JukeBoxAreaController extends MusicAreaController<MusicState, MusicEventTypes>{
    public isActive(): boolean {
        return true;
    }
}