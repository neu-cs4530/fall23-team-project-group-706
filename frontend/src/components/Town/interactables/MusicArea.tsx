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
  import PlayerController from '../../../classes/PlayerController';
  import MusicAreaController, { MusicEventTypes } from '../../../classes/interactable/MusicAreaController';
  import { InteractableID } from '../../../types/CoveyTownSocket';
  import MusicAreaInteractable from './MusicAreaInteractable';
  
  function MusicArea({ interactableID }: { interactableID: InteractableID }): JSX.Element  {
    const musicAreaController = useInteractableAreaController<MusicAreaController<MusicEventTypes>>(interactableID);
    const townController = useTownController();
    // const [observers, setObservers] = useState<PlayerController[]>(musicAreaController.observers);
  
    // useEffect(() => {
    //   const updateMusicState = () => {
    //     // set queue status
    //     // set play or pause status
    //     // set which song?
  
    //     // const [currentSong, setCurrentSong] = useState(musicAreaController.currentSong);
    //     // setObservers(musicAreaController.observers);
    //   };
  
    //   musicAreaController.addListener('songAddedToQueue', updateMusicState);
    //   return () => {
    //     musicAreaController.removeListener('songAddedToQueue', updateMusicState);
    //   };
    // }, [townController, musicAreaController]);
  
    
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
            <Button bg='lightblue' onClick={ async () => {
                try {
                    await musicAreaController.joinSession();
                } catch (error) {
                   // 
                }
                 }}>Login To Music Player</Button>
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
  export default function MusicAreaWrapper(): JSX.Element {
    const musicArea = useInteractable<MusicAreaInteractable>('musicArea');
    const townController = useTownController();
    const closeModal = useCallback(() => {
      if (musicArea) {
        townController.interactEnd(musicArea);
        const controller = townController.getMusicAreaController(musicArea);
        controller.pauseMusic();
      }
    }, [townController, musicArea]);
  
    if (musicArea) {
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