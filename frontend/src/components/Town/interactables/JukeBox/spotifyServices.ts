import axios from 'axios';
import { AuthorizationResponse, SearchResponse, Song, SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';

// change it 
const API_BASE_URL = 'http://localhost:8081';

export const authorizeUser = async (code: string): Promise<AuthorizationResponse> => {
    // console.log('inside authorization', code);
    try {
        const response = await axios.get(`${API_BASE_URL}/authorize`, { params: { code } });
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error during authorization:', error);
        throw error;
    }
};

export const searchSongs = async (query: string): Promise<any> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search`, { params: { query } });
        return response.data; // Adjust based on how your API sends back the data
    } catch (error) {
        console.error('Error searching songs:', error);
        throw error;
    }
};

export const playSong = async (songUri: string): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}/play`, { uri: songUri });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error playing song on frontend:', error.message);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        } else {
            console.error('Error playing song on frontend:', error);
        }
        throw error;
    }
};

export const pauseSong = async (): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}/pause`);
    } catch (error) {
        console.error('Error pausing song:', error);
        throw error;
    }
};

export const addSongToQueue = async (song: SpotifyTrack): Promise<boolean> => {
    try {
        await axios.post(`${API_BASE_URL}/queue`, song);
        return true;
    } catch (error) {
        console.error('Error adding song to queue:', error);
        if (axios.isAxiosError(error)) {
            console.error('Error response:', error.message);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        } else {
            console.error('Error adding song to queue:', error);
        }
        return false;
    }
};

export const getQueue = async (): Promise<SpotifyTrack[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/queue`);
        return response.data;
    } catch (error) {
        console.error('Error fetching queue:', error);
        throw error;
    }
};