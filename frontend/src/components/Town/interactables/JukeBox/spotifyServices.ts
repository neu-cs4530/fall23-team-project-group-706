/* eslint-disable no-useless-catch */
import axios from 'axios';
import {
  AuthorizationResponse,
  SpotifyTrack,
} from '../../../../../../shared/types/CoveyTownSocket';

// change it
const API_BASE_URL = 'http://localhost:8081';

export const authorizeUser = async (code: string): Promise<AuthorizationResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/authorize`, { params: { code } });
    return response.data;
  } catch (error) {
    throw new Error('Authorization failed');
  }
};

export const searchSongs = async (query: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, { params: { query } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const playSong = async (songUri: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/play`, { uri: songUri });
  } catch (error) {
    throw error;
  }
};

export const pauseSong = async (): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/pause`);
  } catch (error) {
    throw error;
  }
};

export const addSongToQueue = async (song: SpotifyTrack): Promise<boolean> => {
  try {
    await axios.post(`${API_BASE_URL}/queue`, song);
    return true;
  } catch (error) {
    return false;
  }
};

export const getQueue = async (): Promise<SpotifyTrack[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/queue`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
