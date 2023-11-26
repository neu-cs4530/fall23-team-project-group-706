import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Container,
    Heading,
    Modal,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
  } from '@chakra-ui/react';
  import React, { useCallback } from 'react';
import {
  useInteractable, useInteractableAreaControllerJukebox } from '../../../../classes/TownController';
  import useTownController from '../../../../hooks/useTownController';
  import { InteractableID } from '../../../../types/CoveyTownSocket';
  import JukeBoxAreaController from '../../../../classes/interactable/JukeBoxAreaController';
  import JukeBoxAreaInteractable from '../JukeBoxAreaInteractable';


  const code = new URLSearchParams(window.location.search).get('code');

  export function JukeBoxArea({ interactableID }: { interactableID: InteractableID }): JSX.Element  {
    const townController = useTownController();
    const musicAreaController = useInteractableAreaControllerJukebox<JukeBoxAreaController>(interactableID);
    // console.log(musicAreaController);
  
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
    const musicArea = useInteractable<JukeBoxAreaInteractable>('jukeBoxArea');
    const townController = useTownController();
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