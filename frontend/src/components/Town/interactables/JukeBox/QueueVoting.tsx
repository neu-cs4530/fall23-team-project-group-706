import React, { useState } from 'react';
import { Box, Input, Button, Text, VStack, HStack, Heading } from '@chakra-ui/react';

interface SongVote {
  name: string;
  votes: number;
}

const QueueVoting: React.FC = () => {
  const [songName, setSongName] = useState('');
  const [songs, setSongs] = useState<SongVote[]>([]);

  const handleSongSubmit = () => {
    if (songName) {
      setSongs(prevSongs => {
        const existingSong = prevSongs.find(
          song => song.name.toLowerCase() === songName.toLowerCase(),
        );
        if (existingSong) {
          return prevSongs.map(song =>
            song.name.toLowerCase() === songName.toLowerCase()
              ? { ...song, votes: song.votes + 1 }
              : song,
          );
        } else {
          return [...prevSongs, { name: songName, votes: 1 }];
        }
      });
      setSongName('');
    }
  };

  const handleVote = (songNme: string) => {
    setSongs(prevSongs =>
      prevSongs.map(song => (song.name === songNme ? { ...song, votes: song.votes + 1 } : song)),
    );
  };
  const itemHeight = 60;
  const maxH = `${10 * itemHeight}px`;
  return (
    <Box maxH={maxH} overflowY='auto' p={3}>
      <Heading as='h2' size='md' mb={4}>
        Vote For Your Fav Song!!!
      </Heading>
      <VStack spacing={4}>
        {/* Input and Submit Button */}
        <Box w='100%'>
          <Input
            placeholder='Enter a song name'
            value={songName}
            onChange={e => setSongName(e.target.value)}
            mb={2} // Margin bottom for spacing
          />
          <Button colorScheme='blue' w='full' onClick={handleSongSubmit}>
            Submit Song
          </Button>
        </Box>

        {/* Songs List */}
        {songs
          .sort((a, b) => b.votes - a.votes)
          .map((song, index) => (
            <HStack key={index} justify='space-between' w='100%'>
              <Text>{song.name}</Text>
              <Button colorScheme='green' onClick={() => handleVote(song.name)}>
                Vote ({song.votes})
              </Button>
            </HStack>
          ))}
      </VStack>
    </Box>
  );
};

export default QueueVoting;
