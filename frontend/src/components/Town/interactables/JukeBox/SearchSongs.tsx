import React from 'react';
import { SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';
import { pauseSong, playSong } from './spotifyServices';
import { Button, Box, Text, Flex, IconButton, Heading } from '@chakra-ui/react';
import QueueIcon from './QueueIcon';
import PlayIcon from './PlayIcon';
import PauseIcon from './PauseIcon';

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

  const handlePauseSong = async () => {
    try {
      await pauseSong();
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  return (
    <Box
      maxH='400px' // Maximum height of the container
      overflowY='auto' // Enable vertical scrolling
      p={2}
      bg='white'
      shadow='md'
      borderRadius='md'>
      {songs.map(song => (
        <Flex key={song.id} alignItems='center' mb={3} p={2} bg='gray.100' borderRadius='md'>
          <Text flex={1} fontWeight='bold' mr={2} color='black'>
            {' '}
            {/* Color set to black */}
            {song.name} by {song.artists.map(artist => artist.name).join(', ')}
          </Text>
          <IconButton
            icon={<QueueIcon />}
            colorScheme='green'
            aria-label='Add to Queue'
            onClick={() => onAddToQueue(song)}
            mr={2}
          />
          <IconButton
            icon={<PlayIcon />}
            colorScheme='blue'
            aria-label='Play'
            onClick={() => handlePlaySong(song.uri)}
            mr={2}
          />
          <IconButton
            icon={<PauseIcon />}
            colorScheme='red'
            aria-label='Pause'
            onClick={handlePauseSong}
          />
        </Flex>
      ))}
    </Box>
  );
};

export default SearchSongs;
