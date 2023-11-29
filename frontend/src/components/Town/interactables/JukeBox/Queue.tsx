import React from 'react';
import { SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';
import { Box, Heading, List, ListItem, Text } from '@chakra-ui/react';

interface QueueProps {
    queue: SpotifyTrack[];
}

const Queue: React.FC<QueueProps> = ({ queue }) => {
    console.log('Queue data:', queue); 
    return (
        <Box>
            <Heading as="h2" size="lg" mb={4}>Queue</Heading>
            <List spacing={3}>
                {queue.map((track, index) => (
                    <ListItem key={track.id || index} display="flex" alignItems="center">
                        <Text flex={1}>
                            {track.name ? track.name : 'Unknown Song'} by {track.artists && track.artists.length > 0 ? track.artists.map(artist => artist.name).join(', ') : 'Unknown Artist'}
                        </Text>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Queue;
