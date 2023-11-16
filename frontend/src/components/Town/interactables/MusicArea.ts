import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Heading,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import Interactable, { KnownInteractableTypes } from '../Interactable';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import MusicAreaController, { MusicEventTypes } from '../../../classes/interactable/MusicAreaController';
import { InteractableID, MusicArea } from '../../../types/CoveyTownSocket';
import MusicAreaInteractable from './MusicAreaInteractable';

function MusicArea({ interactableID }: { interactableID: InteractableID }): JSX.Element  {
  const [joiningSession, setJoiningSession] = useState(false);
  const [pauseSession, setPauseSession] = useState(false);
  const [currentSong, setCurrentSong] = useState('');
  
  const musicAreaController = useInteractableAreaController<MusicAreaController<MusicEventTypes>>(interactableID);

  const townController = useTownController();
  useEffect(() => {
    const updateMusicState = () => {
      // set queue status
      // set play or pause status
      // set which song?
    };

    musicAreaController.addListener('queueUpdated', updateMusicState);
    return () => {
      musicAreaController.removeListener('queueUpdated', updateMusicState);
    };
  }, [townController, musicAreaController]);

  return (
    <Container> hey < /Container>
  );
  
}






/**
 * A wrapper component for the TicTacToeArea component.
 * Determines if the player is currently in a tic tac toe area on the map, and if so,
 * renders the TicTacToeArea component in a modal.
 *
 */
export default function MusicAreaWrapper(): JSX.Element {
  const musicArea = useInteractable<MusicAreaInteractable>('musicArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (musicArea) {
      townController.interactEnd(musicArea);
      const controller = townController.getMusicAreaController(musicArea);
      controller.leaveSession();
    }
  }, [townController, musicArea]);

  if (musicArea && musicArea.getData('type') === 'TicTacToe') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{musicArea.name}</ModalHeader>
          <ModalCloseButton />
          <MusicArea interactableID={musicArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}