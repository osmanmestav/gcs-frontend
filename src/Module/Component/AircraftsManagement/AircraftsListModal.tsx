import { useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { PubSubEvent, removeEvent, subscribeEvent } from "../../../utils/PubSubService";

type AircraftsListModalProps = {
    show: boolean;
    onCloseModal: (isCancelled: boolean) => void;
}

const AircraftsListModal = (props: AircraftsListModalProps) => {
    
    const onStatusReceived = (args: any[]) => {
        console.log(args[0]);
    }

    useEffect(() => {
        subscribeEvent(PubSubEvent.StatusMessageReceivedOnAircraftManagement, onStatusReceived);
        return () => {
            removeEvent(PubSubEvent.StatusMessageReceivedOnAircraftManagement, onStatusReceived);
        }
    })

    return (
        <Modal
            show={props.show}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Manage Aircrafts
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                List of aircrafts.
            </Modal.Body>
            <Modal.Footer>
                <Button variant={"success"} onClick={() => { props.onCloseModal(false); }}>
                    Ok
                </Button>
                <Button onClick={() => { props.onCloseModal(true); }}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>    
    );
}

export default AircraftsListModal;