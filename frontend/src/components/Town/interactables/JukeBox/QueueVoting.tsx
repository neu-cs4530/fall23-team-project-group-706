import { Box, Heading, List, ListItem, Text } from '@chakra-ui/react';

interface QueueVotingProps {
    voting: Map<string, number>;
}

const QueueVoting: React.FC<QueueVotingProps> = ({ voting }) => {
  console.log('Voting data:', voting);
  const votingArray = Array.from(voting);
  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        Queue VOTING
      </Heading>
      <List spacing={3}>
        {votingArray.map(([songName, votes]) => (
          <ListItem key={songName}>
            <Text flex={1}>
              song name: {songName} - {votes} votes
            </Text>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default QueueVoting;
