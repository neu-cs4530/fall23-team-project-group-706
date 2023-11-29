import React from 'react';
import { SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';
import { playSong } from './spotifyServices';
import { Button, Box, Text } from '@chakra-ui/react';

interface SearchSongsProps {
  onAddToQueue: (songUri: SpotifyTrack) => void;
  songs: SpotifyTrack[];
}

const SearchSongs: React.FC<SearchSongsProps> = ({ onAddToQueue, songs }) => {
  const handlePlaySong = async (songUri: string) => {
    try {
      await playSong(songUri);
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  return (
    <Box>
      {songs.map(song => (
        <Box key={song.id} display='flex' alignItems='center' mb={3}>
          <Text flex={1}>
            {song.name} by {song.artists.map(artist => artist.name).join(', ')}
          </Text>
          <Button colorScheme='green' onClick={() => onAddToQueue(song)} mr={2}>
            Add to Queue
          </Button>
          <Button colorScheme='blue' onClick={() => handlePlaySong(song.uri)}>
            Play
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default SearchSongs;
