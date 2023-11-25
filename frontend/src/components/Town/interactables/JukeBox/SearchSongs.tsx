import React, { useState, ChangeEvent } from 'react';
import { Song } from '../../../../../../shared/types/CoveyTownSocket';
import { addSongToQueue, searchSongs } from './spotifyServices';




const SearchSongs: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [songs, setSongs] = useState<Song[]>([]);

    const handleSearch = async () => {
        if (query) {
            try {
                const results = await searchSongs(query);
                setSongs(results);
            } catch (error) {
                console.error('Error searching songs:', error);
            }
        }
    };

    const handleAddToQueue = async (songUri: string) => {
        try {
            await addSongToQueue(songUri);
            // Handle successful addition to queue, maybe notify the user
        } catch (error) {
            console.error('Error adding song to queue:', error);
            // Handle the error, maybe display a message to the user
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    return (
        <div>
            <input type="text" value={query} onChange={handleInputChange} />
            <button onClick={handleSearch}>Search</button>
            <ul>
                {songs.map((song) => (
                    <li key={song.id}>
                        {song.name} by {song.artists.map((artist) => artist.name).join(', ')}
                        <button onClick={() => handleAddToQueue(song.uri)}>Add to Queue</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchSongs;
