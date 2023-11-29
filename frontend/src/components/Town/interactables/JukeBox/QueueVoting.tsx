import { SpotifyTrack } from '../../../../../../shared/types/CoveyTownSocket';
import { Box, Heading, List, ListItem, Text } from '@chakra-ui/react';

interface QueueVotingProps {
    voting: Map<string, number>;
}

const QueueVoting: React.FC<QueueVotingProps> = ({ voting }) => {
    console.log('Voting data:', voting); 
    return (
        <Box>
            <Heading as="h2" size="lg" mb={4}>Queue</Heading>
            <List spacing={3}>
                {voting.forEach((votes, songName) => (
                    <ListItem>
                    <Text flex={1}>
                      TODO
                        </Text>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default QueueVoting;
