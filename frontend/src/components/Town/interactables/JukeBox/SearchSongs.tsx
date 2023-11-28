import React, { useState, ChangeEvent } from 'react';
import { SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';
import { addSongToQueue, playSong, searchSongs } from './spotifyServices';
import { Input, Button, List, ListItem, Box, Text } from '@chakra-ui/react';


const SearchSongs: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [songs, setSongs] = useState<SpotifyTrack[]>([]);

    const handleSearch = async () => {
        if (query) {
            try {
                const results = await searchSongs(query);
                if (results&& results) {
                    setSongs(results);
                }
            } catch (error) {
                console.error('Error searching songs:', error);
            }
        }
    };

    const handleAddToQueue = async (songUri: string) => {
        try {
            await addSongToQueue(songUri);
        } catch (error) {
            console.error('Error adding song to queue:', error);
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handlePlaySong = async (songUri: string) => {
        try {
            await playSong(songUri);
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    return (
        <Box>
            <Input 
                placeholder="Search songs" 
                value={query} 
                onChange={handleInputChange} 
            />
            <Button colorScheme="blue" onClick={handleSearch}>
                Search
            </Button>
            <List spacing={3}>
                {songs.map((song) => (
                    <ListItem key={song.id}>
                        <Text>
                            {song.name} by {song.artists.map((artist) => artist.name).join(', ')}
                        </Text>
                        <Button 
                            colorScheme="green" 
                            onClick={() => handleAddToQueue(song.uri)}
                        >
                            Add to Queue
                        </Button>
                        <Button 
                            colorScheme="teal" 
                            onClick={() => handlePlaySong(song.uri)}
                            ml={2}
                        >
                            Play
                        </Button>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};


export default SearchSongs;
