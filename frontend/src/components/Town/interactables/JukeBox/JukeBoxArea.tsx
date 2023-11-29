/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box,
  Button,
  Container,
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
    <Container>
      <Box>
        {!isAuthenticated && <LoginButton />}
        {isAuthenticated && <Text>Welcome to Your JukeBox!</Text>}
      </Box>
      <Input
        placeholder='Search songs...'
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        mb={4}
      />
      <Button colorScheme='blue' onClick={handleSearch} mb={4}>
        Search
      </Button>
      <SearchSongs onAddToQueue={handleAddToQueue} songs={songs} />
      <Queue queue={queue} />
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
