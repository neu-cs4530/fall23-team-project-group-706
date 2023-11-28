import React from 'react';
import { SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';
import { Box, Heading, List, ListItem, Text } from '@chakra-ui/react';

interface QueueProps {
    queue: SpotifyTrack[];
}

const Queue: React.FC<QueueProps> = ({ queue }) => {
    return (
        <Box>
            <Heading as="h2" size="lg" mb={4}>Queue</Heading>
            <List spacing={3}>
                {queue.map((song, index) => (
                    <ListItem key={index} display="flex" alignItems="center">
                        <Text flex={1}>
                            {song.name} by {song.artists.map((artist) => artist.name).join(', ')}
                        </Text>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Queue;
