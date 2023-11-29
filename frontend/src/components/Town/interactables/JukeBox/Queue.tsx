import React from 'react';
import { SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';
import { Box, Flex, Heading, List, ListItem, Text, Image } from '@chakra-ui/react';

interface QueueProps {
  queue: SpotifyTrack[];
}

const Queue: React.FC<QueueProps> = ({ queue }) => {
  const itemHeight = 60;
  const maxH = `${8 * itemHeight}px`;
  return (
    <Box>
      <Heading as='h2' size='md' mb={4}>
        Queue
      </Heading>
      <Box maxH={maxH} overflowY='auto'>
        <List spacing={3}>
          {queue.map((track, index) => (
            <ListItem key={track.id || index} display='flex' alignItems='center'>
              <Image
                src={track.album && track.album.images[0]?.url}
                alt={track.name}
                boxSize='50px'
                objectFit='cover'
                borderRadius='md'
                mr={3}
              />
              <Flex flex={1} direction='column' overflow='hidden'>
                <Text fontWeight='bold' isTruncated>
                  {track.name ? track.name : 'Unknown Song'}
                </Text>
                <Text fontSize='sm' color='black' fontWeight='semibold'>
                  {track.artists && track.artists.length > 0
                    ? track.artists.map(artist => artist.name).join(', ')
                    : 'Unknown Artist'}
                </Text>
              </Flex>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Queue;
