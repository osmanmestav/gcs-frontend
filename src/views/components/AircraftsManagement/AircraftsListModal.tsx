import {useEffect, useState} from "react";
import {Button, Modal, Table, Form} from "react-bootstrap";
import { AircraftIdentifier, AircraftPilotageStatus, PilotageState } from "../../../models/aircraftModels/aircraft";
import { AircraftStatusTopicMessage } from "../../../models/brokerModels/aircraftStatusTopicMessage";
import { UserStatusTopicMessage } from "../../../models/brokerModels/userStatusTopicMessage";
import { UserCredentials } from "../../../models/userModels/userCredentials";
import {PubSubEvent, removeEvent, subscribeEvent} from "../../../utils/PubSubService";

type AircraftsListModalProps = {
    user: UserCredentials;
    show: boolean;
    aircraftStates: AircraftPilotageStatus[];
    onCloseModal: (isCancelled: boolean, aircraftNames: AircraftPilotageStatus[]) => void;
};



class AircraftControlListViewModel {
    constructor(pilotage: AircraftPilotageStatus[]){
        this.pilotage = pilotage;
    }

    pilotage: AircraftPilotageStatus[];

    isControlling = (aircraftCertificateName: string) => {
        const status = this.pilotage.find(x=> x.aircraftIdentifier.aircraftCertificateName === aircraftCertificateName);
        if(status){
            return status.isControlling();
        }
        return false;
    }

    isObserving = (aircraftCertificateName: string) => {
        const status = this.pilotage.find(x=> x.aircraftIdentifier.aircraftCertificateName === aircraftCertificateName);
        if(status){
            return status.isObserving();
        }
        return false;
    }

    control = (identifier: AircraftIdentifier) => {
        const status = this.pilotage.find(x=> x.aircraftIdentifier.aircraftCertificateName === identifier.aircraftCertificateName);
        if(status){
            if(status.isControlling()){
                status.state = PilotageState.None;
            }
            else if (status.isObserving()){
                status.state = PilotageState.Controlling;
            }
            else
                status.state = PilotageState.Controlling;
        }
        else {
            this.pilotage.push(new AircraftPilotageStatus(identifier, PilotageState.Controlling));
        }
    }

    observe = (identifier: AircraftIdentifier) => {
        const status = this.pilotage.find(x=> x.aircraftIdentifier.aircraftCertificateName === identifier.aircraftCertificateName);
        if(status){
            if(status.isControlling()){
                return;
            }
            else if (status.isObserving()){
                status.state = PilotageState.None;
            }
            else
                status.state = PilotageState.Observing;
        }
        else {
            this.pilotage.push(new AircraftPilotageStatus(identifier, PilotageState.Observing));
        }
    }
}

const noControllerMessage = 'Not In Control';
/**
 * string name: aircraft name
 * enum userState: aircraft control status
 * string controller pilot name / Controlling By
 * string Array observers: pilot observers list / Observing By
 */
class AircraftsListItemViewModel {
    constructor(identfier: AircraftIdentifier, controller: string) {
        this.aircraftIdentifier = identfier;
        this.controller = controller;
        this.observers = [];
    }

    aircraftIdentifier: AircraftIdentifier;
    private controller: string;
    private observers: string[];

    hasController = () => {
        return this.controller !== noControllerMessage;
    }

    setController = (controller: string) => {
        this.controller = controller;
        if(controller !== noControllerMessage)
            this.insertObserver(controller);
    }

    isObservedBy = (observerName: string) => {
        return this.observers.some(x => x === observerName);
    }

    insertObserver = (observerName: string) => {
        if(!this.isObservedBy(observerName)){
            this.observers.push(observerName);
        }
    }

    removeObserver = (observerName: string) => {
        if(this.isObservedBy(observerName)){
            this.observers = this.observers.filter(x=> x !== observerName);
        }
    }

    displayController = () => {
        return this.controller;
    }

    displayObservers = () => {
        if(this.observers.length > 0)
            return this.observers.reduce((prev, cur) => prev + cur + '; ', '');

        return 'No Observers';
    }
}

class AircraftsListViewModel {
    constructor() {
        this.aircraftItems = [];
    };

    private aircraftItems: AircraftsListItemViewModel[];

    getAircraftItemList = () => {
        return this.aircraftItems;
    };

    anyAircraft = () => {
        return this.aircraftItems.length > 0;
    };

    getAircraftByName = (aircraftCertificateName: string) => {
        return this.aircraftItems.find(x => x.aircraftIdentifier.aircraftCertificateName === aircraftCertificateName);
    }

    setAircraftController = (statusMsg: AircraftStatusTopicMessage) => {
        const controller = statusMsg.gcsController.userCode ?? noControllerMessage;
        const aircraft = this.getAircraftByName(statusMsg.aircraftCertificateName);
        if(aircraft){
            aircraft.setController(controller);
        }
        else {
            const identifier : AircraftIdentifier = {
                aircraftId: statusMsg.aircraftId,
                aircraftName: statusMsg.aircraftName,
                aircraftCertificateName: statusMsg.aircraftCertificateName
            };
            const newAircraft = new AircraftsListItemViewModel(identifier, controller);
            this.aircraftItems.push(newAircraft);
        }
    }

    setObservers = (observer: string, listOfAircrafts: string[]) => {
        listOfAircrafts.forEach(aircraftCertificateName => {
            const aircraft = this.getAircraftByName(aircraftCertificateName);
            if(aircraft){
                aircraft.insertObserver(observer);
            }
        });
        this.aircraftItems.forEach(aircraft => {
            if(aircraft.isObservedBy(observer)){
                if(!listOfAircrafts.some(x=> x === aircraft.aircraftIdentifier.aircraftCertificateName)){
                    aircraft.removeObserver(observer);
                }
            }
        })
    }

    hasController = (aircraftCertificateName: string) => {
        const aircraft = this.getAircraftByName(aircraftCertificateName);
        if(aircraft){
            return aircraft.hasController();
        }
        return false;
    }
}

const AircraftsListModal = (props: AircraftsListModalProps) => {
    const [aircraftListItems, setAircraftListItems] = useState<AircraftsListViewModel>(new AircraftsListViewModel());
    const [aircraftControlList, setAircraftControlList] = useState<AircraftControlListViewModel>( new AircraftControlListViewModel(props.aircraftStates));

    //Aircraft List
    const onAircraftStatusReceived = (statusMessages: AircraftStatusTopicMessage[]) => {
        statusMessages.forEach((statusMsg) => {
            aircraftListItems.setAircraftController(statusMsg);
            if(props.user.userCode === statusMsg.gcsController.userCode){
                const identifier : AircraftIdentifier = {
                    aircraftId: statusMsg.aircraftId,
                    aircraftName: statusMsg.aircraftName,
                    aircraftCertificateName: statusMsg.aircraftCertificateName
                };
                if(!aircraftControlList.isControlling(statusMsg.aircraftCertificateName)){
                    aircraftControlList.control(identifier);
                    setAircraftControlList({...aircraftControlList});
                }
            }
        });
        // @ts-ignore
        setAircraftListItems({...aircraftListItems});
    }

    const onUserStatusReceived = (statusMessages: UserStatusTopicMessage[]) => {
        statusMessages.forEach((statusMsg) => {
            aircraftListItems.setObservers(statusMsg.userCode, statusMsg.listOfObservingAircrafts);
        });
        // @ts-ignore
        setAircraftListItems({...aircraftListItems});
    }

    useEffect(() => {
        subscribeEvent(PubSubEvent.AnyAircraftStatusMessageReceived, onAircraftStatusReceived);
        subscribeEvent(PubSubEvent.AnyUserStatusMessageReceived, onUserStatusReceived);
        return () => {
            removeEvent(PubSubEvent.AnyUserStatusMessageReceived, onUserStatusReceived);
            removeEvent(PubSubEvent.AnyAircraftStatusMessageReceived, onAircraftStatusReceived);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal
            show={props.show}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Manage Aircrafts (Tenant Code: {props.user.tenantCode}; User Code: {props.user.userCode}; Role: {props.user.isPilot ? "Pilot" : "Observer"})
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th style={{width:'60px'}}>#</th>
                        <th style={{width:'200px'}}>Aircraft Name</th>
                        <th style={{width:'150px'}}>Controlling By</th>
                        <th style={{width:'300px'}}>Observing By</th>
                        <th style={{width:'200px'}}>Claim/Control</th>
                        <th style={{width:'200px'}}>Observe</th>
                    </tr>
                    </thead>
                    <tbody>
                    {aircraftListItems.anyAircraft() &&
                    aircraftListItems.getAircraftItemList().map((data, index) => {
                        return (
                            // @ts-ignore
                            <tr key={index}>
                                <td>{(index + 1)}</td>
                                <td>{data.aircraftIdentifier.aircraftName + ' / ' + data.aircraftIdentifier.aircraftCertificateName}</td>
                                <td>{data.displayController() }</td>
                                <td>{ data.displayObservers() }
                                </td>
                                <td>
                                    <Form.Check
                                        inline
                                        label={!aircraftControlList.isControlling(data.aircraftIdentifier.aircraftCertificateName) ? 'Take Control' : 'Already controlling'}
                                        name={data.aircraftIdentifier.aircraftCertificateName}
                                        type="checkbox"
                                        disabled={aircraftListItems.hasController(data.aircraftIdentifier.aircraftCertificateName) || !props.user.isPilot}
                                        id={data.aircraftIdentifier.aircraftName + "inline" + index}
                                        checked={aircraftControlList.isControlling(data.aircraftIdentifier.aircraftCertificateName)}
                                        onChange={(e) => {
                                            aircraftControlList.control(data.aircraftIdentifier);
                                            setAircraftControlList({...aircraftControlList});
                                        }}
                                    />
                                </td>
                                <td>
                                    <Form.Check
                                        label={!aircraftControlList.isObserving(data.aircraftIdentifier.aircraftCertificateName) ? 'Observe' : 'Give up observing'}
                                        name={data.aircraftIdentifier.aircraftName}
                                        disabled={aircraftControlList.isControlling(data.aircraftIdentifier.aircraftCertificateName)}
                                        type="checkbox"
                                        id={data.aircraftIdentifier.aircraftName + "inline" + index}
                                        checked={aircraftControlList.isObserving(data.aircraftIdentifier.aircraftCertificateName)}
                                        onChange={(e) => {
                                            aircraftControlList.observe(data.aircraftIdentifier);
                                            setAircraftControlList({...aircraftControlList});
                                        }}
                                    />
                                </td>
                            </tr>
                        );
                    })
                    }
                    </tbody>
                </Table>

            </Modal.Body>
            <Modal.Footer>
                <Button variant={"success"} onClick={() => {
                    props.onCloseModal(false, aircraftControlList.pilotage);
                }}>
                    Ok
                </Button>
                <Button onClick={() => {
                    props.onCloseModal(true, []);
                }}>
                    Cancel
                </Button>
                <Button onClick={() => {
                    console.log(props.aircraftStates)
                }}>
                    Console Logger (Temporary)
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AircraftsListModal;
