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
  useInteractable, useInteractableAreaControllerJukebox } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import PlayerController from '../../../../classes/PlayerController';
  import { InteractableID, SpotifyTrack } from '../../../../types/CoveyTownSocket';
  import JukeBoxAreaController from '../../../../classes/interactable/JukeBoxAreaController';
  import JukeBoxAreaInteractable from '../JukeBoxAreaInteractable';
  import LoginButton from './LoginButton';
  import { addSongToQueue, authorizeUser, getQueue, searchSongs } from './spotifyServices';
import SearchSongs from './SearchSongs';
import Queue from './Queue';
import QueueVoting from './queueVoting';


  export function JukeBoxArea({ interactableID }: { interactableID: InteractableID }): JSX.Element  {
    const townController = useTownController();
    const musicAreaController = useInteractableAreaControllerJukebox<JukeBoxAreaController>(interactableID);
    const [observers, setObservers] = useState<PlayerController[]>(musicAreaController.occupants);
    const [voting, setVoting] = useState(musicAreaController.votingHistory);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [songs, setSongs] = useState<SpotifyTrack[]>([]);
    const [queue, setQueue] = useState<SpotifyTrack[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [triggerUpdate, setTriggerUpdate] = useState(false);
    const [votingCountdown, setVotingCountdown] = useState(10); // Set the initial countdown time

    useEffect(() => {
      const code = new URLSearchParams(window.location.search).get('code');
      const handleAuthentication = async (code: string) => {
        try {
            await authorizeUser(code);
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
      musicAreaController.addListener('votingUpdated', updateVote);

      // this would be -1 every second TODO
      musicAreaController.addListener('votingCountdownUpdated', updateVote);
      musicAreaController.addListener('votingFinished', submitVote);
      const fetchQueue = async () => {
          try {
              const fetchedQueue = await getQueue();
              setQueue(fetchedQueue);
          } catch (error) {
              console.error('Error fetching queue:', error);
          }
      };
      fetchQueue();
      return () => {
        musicAreaController.removeListener('votingUpdated', updateVote);
        musicAreaController.removeListener('votingFinished', submitVote);
        musicAreaController.removeListener('votingCountdownUpdated', handleCountdown);
      };
    }, [triggerUpdate, musicAreaController, votingCountdown]);

    const handleCountdown = () => {
      if (votingCountdown > 0) {
        setVotingCountdown(votingCountdown-1)
      }
    };

    const updateVote = () => {
      setVoting(musicAreaController.votingHistory)
    };

    const submitVote = async () => {
      // called when the countdown reaches 0
      setVoting(musicAreaController.votingHistory)
      // handleAddToQueue(musicAreaController.getHighestVote);
      // note: since we need the spotify track, and we only have access to it in front end, we dont rlly use music area controller...?
   };

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
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                mb={4}
            />
            <Button colorScheme="blue" onClick={handleSearch} mb={4}>
                Search
            </Button>
        <SearchSongs onAddToQueue={handleAddToQueue} songs={songs} updateVote={updateVote} />
        <Queue queue={queue} />
        <QueueVoting voting = {voting}></QueueVoting>
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