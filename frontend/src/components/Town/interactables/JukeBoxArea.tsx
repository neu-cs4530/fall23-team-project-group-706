
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
  import PlayerController from '../../../classes/PlayerController';
  import MusicAreaController, { MusicEventTypes } from '../../../classes/interactable/MusicAreaController';
  import { InteractableID } from '../../../types/CoveyTownSocket';
  import MusicAreaInteractable from './MusicAreaInteractable';
  import JukeBoxAreaController from '../../../classes/interactable/JukeBoxAreaController';
  import MusicApp from './MusicApp';

  const code = new URLSearchParams(window.location.search).get('code');
  
  function MusicArea({ interactableID }: { interactableID: InteractableID }): JSX.Element  {
    const musicAreaController = useInteractableAreaController<JukeBoxAreaController>(interactableID);
    const townController = useTownController();
  
    return (
      <Container>
        <Accordion allowToggle>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Current Observers
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            {/* <List aria-label='list of observers in the game'>
              {observers.map(player => {
                return <ListItem key={player.id}>{player.userName}</ListItem>;
              })}
            </List> */}
            < MusicApp/>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
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
    const musicArea = useInteractable<MusicAreaInteractable>('musicArea');
    const townController = useTownController();
    const closeModal = useCallback(() => {
      if (musicArea) {
        townController.interactEnd(musicArea);
        const controller = townController.getMusicAreaController(musicArea);
        controller.pauseMusic();
      }
    }, [townController, musicArea]);
  
    if (musicArea && musicArea.getType() === 'musicArea') {
      return (
        <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{musicArea.name}</ModalHeader>
            <ModalCloseButton />
            <MusicArea interactableID={musicArea.name} /> 
          </ModalContent>
        </Modal>
      );
    }
    return <></>;
  }