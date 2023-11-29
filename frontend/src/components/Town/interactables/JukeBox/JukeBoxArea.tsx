/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  useInteractable,
  useInteractableAreaControllerJukebox,
} from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID, SpotifyTrack } from '../../../../types/CoveyTownSocket';
import JukeBoxAreaController from '../../../../classes/interactable/JukeBoxAreaController';
import JukeBoxAreaInteractable from '../JukeBoxAreaInteractable';
import LoginButton from './LoginButton';
import { addSongToQueue, authorizeUser, getQueue, searchSongs } from './spotifyServices';
import SearchSongs from './SearchSongs';
import Queue from './Queue';
import QueueVoting from './QueueVoting';

export function JukeBoxArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const townController = useTownController();
  const musicAreaController =
    useInteractableAreaControllerJukebox<JukeBoxAreaController>(interactableID);
  const [voting, setVoting] = useState(musicAreaController.votingHistory);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [songs, setSongs] = useState<SpotifyTrack[]>([]);
  const [queue, setQueue] = useState<SpotifyTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerUpdate, setTriggerUpdate] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    const handleAuthentication = async (codeUrl: string) => {
      try {
        await authorizeUser(codeUrl);
        setIsAuthenticated(true);
        window.history.pushState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };
    if (code) {
      console.log('Authorization code found:', code);
      handleAuthentication(code);
    }
  }, []);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const fetchedQueue = await getQueue();
        setQueue(fetchedQueue);
      } catch (error) {
        console.error('Error fetching queue:', error);
      }
    };
    fetchQueue();
  }, [triggerUpdate]);

  const handleSearch = async () => {
    try {
      const results = await searchSongs(searchQuery);
      setSongs(results);
    } catch (error) {
      console.error('Error searching for songs:', error);
    }
  };

  const handleAddToQueue = async (song: SpotifyTrack) => {
    const success = await addSongToQueue(song);
    if (success) {
      setTriggerUpdate(prev => !prev); // Toggle to trigger queue update
      setQueue(prevQueue => [...prevQueue, song]);
    }
  };

  return (
    <Container maxW='container.xl' p={4} bgGradient='linear(to-br, gray.800, black)'>
      {/* Login and Welcome Text */}
      <Box mb={6} bg='blue.500' color='white' p={3} borderRadius='md'>
        {!isAuthenticated && <LoginButton />}
        {isAuthenticated && (
          <Text fontSize='xl' mb={4}>
            Welcome to Your JukeBox!
          </Text>
        )}
      </Box>

      {/* Main Content Grid */}
      <Grid templateColumns='1fr 3fr 1fr' gap={6}>
        <GridItem bg='purple.500' color='white' p={3} borderRadius='md'>
          {/* Queue Voting Component */}
          <QueueVoting />
        </GridItem>

        <GridItem bg='orange.400' color='white' p={3} borderRadius='md'>
          {/* Search Section and Search Songs Component */}
          <Box mb={6}>
            <Input
              placeholder='Search songs...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              mb={4}
            />
            <Button colorScheme='teal' onClick={handleSearch}>
              Search
            </Button>
          </Box>
          <SearchSongs onAddToQueue={handleAddToQueue} songs={songs} />
        </GridItem>

        <GridItem bg='red.500' color='white' p={3} borderRadius='md'>
          {/* Queue Component */}
          <Queue queue={queue} />
        </GridItem>
      </Grid>
    </Container>
  );
}

/**
 * A wrapper component for the MusicaArea component.
 * Determines if the player is currently in a music area on the map, and if so,
 * renders the MusicArea component in a modal.
 *
 */
export default function JukeBoxAreaWrapper(): JSX.Element {
  const musicArea = useInteractable<JukeBoxAreaInteractable>('jukeBoxArea');
  const townController = useTownController();
  useEffect(() => {
    if (musicArea) {
      townController.pause();
    } else {
      townController.unPause();
    }
  }, [townController, musicArea]);

  const closeModal = useCallback(() => {
    if (musicArea) {
      townController.interactEnd(musicArea);
    }
  }, [townController, musicArea]);

  if (musicArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalContent>
          <ModalHeader>{musicArea.name}</ModalHeader>
          <ModalCloseButton />
          <JukeBoxArea interactableID={musicArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
