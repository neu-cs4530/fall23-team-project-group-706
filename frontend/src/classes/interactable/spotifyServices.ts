import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const authorizeUser = async (code: string): Promise<any> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/authorize`, { params: { code } });
        return response.data;
    } catch (error) {
        console.error('Error during authorization:', error);
        throw error;
    }
};

export const searchSongs = async (query: string): Promise<any[]> => {
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
        console.error('Error playing song:', error);
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

export const addSongToQueue = async (songUri: string): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}/queue`, { uri: songUri });
    } catch (error) {
        console.error('Error adding song to queue:', error);
        throw error;
    }
};