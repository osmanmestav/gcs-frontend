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

class PilotageStatus extends AircraftPilotageStatus {
    constructor(status: AircraftPilotageStatus, isOriginal: boolean){
        super(status.aircraftIdentifier, status.state);
        this.isOriginal = isOriginal;
    }
    isOriginal: boolean;
}

class PilotageStatusViewModel {
    constructor(pilotage: AircraftPilotageStatus[]){
        this.pilotageStates = pilotage.map(x=> new PilotageStatus(x, true));
    }

    pilotageStates: PilotageStatus[];

    isControlling = (aircraftCertificateName: string) => {
        const status = this.pilotageStates.find(x=> x.aircraftIdentifier.aircraftCertificateName === aircraftCertificateName);
        if(status){
            return status.isControlling();
        }
        return false;
    }

    isControlRequestAvailable = (aircraftCertificateName: string) => {
        const status = this.pilotageStates.find(x=> x.aircraftIdentifier.aircraftCertificateName === aircraftCertificateName);
        if(status){
            return !status.isControlling() || !status.isOriginal;
        }
        return true;
    }

    isObserving = (aircraftCertificateName: string) => {
        const status = this.pilotageStates.find(x=> x.aircraftIdentifier.aircraftCertificateName === aircraftCertificateName);
        if(status){
            return status.isObserving();
        }
        return false;
    }

    insertControlInformation = (identifier: AircraftIdentifier) => {
        const status = this.pilotageStates.find(x=> x.aircraftIdentifier.aircraftCertificateName === identifier.aircraftCertificateName);
        if(status){
            status.state = PilotageState.Controlling;
        }
        else {
            this.pilotageStates.push( 
                new PilotageStatus(new AircraftPilotageStatus(identifier, PilotageState.Controlling), true)
            );
        }
    }

    toggleControlInformation = (identifier: AircraftIdentifier) => {
        const status = this.pilotageStates.find(x=> x.aircraftIdentifier.aircraftCertificateName === identifier.aircraftCertificateName);
        if(status) {
            if(status.isControlling()){
                status.state = PilotageState.None;
            }
            else {
                status.state = PilotageState.Controlling;
            }
        }
        else {
            this.pilotageStates.push(
                new PilotageStatus(new AircraftPilotageStatus(identifier, PilotageState.Controlling), false)
            );
        }
    }

    toggleObserveInformation = (identifier: AircraftIdentifier) => {
        const status = this.pilotageStates.find(x=> x.aircraftIdentifier.aircraftCertificateName === identifier.aircraftCertificateName);
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
            this.pilotageStates.push(
                new PilotageStatus(new AircraftPilotageStatus(identifier, PilotageState.Observing), false)
            );
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
class AircraftViewModel {
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
        // do not add a controller as an observer
        // if(controller !== noControllerMessage)
        //     this.insertObserver(controller);
    }

    isObservedBy = (observerName: string) => {
        return this.observers.some(x => x === observerName);
    }

    isControlledBy = (controllerName: string) => {
        return this.controller === controllerName;
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

    private aircraftItems: AircraftViewModel[];

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
            const newAircraft = new AircraftViewModel(identifier, controller);
            this.aircraftItems.push(newAircraft);
        }
    }

    setObservers = (observer: string, listOfAircrafts: string[]) => {
        // insert observer if not in aircraft observer list.
        listOfAircrafts.forEach(aircraftCertificateName => {
            const aircraft = this.getAircraftByName(aircraftCertificateName);
            if(aircraft && !aircraft.isControlledBy(observer)){
                aircraft.insertObserver(observer);
            }
        });
        // remove from aircraft observer list if not incoming-updated list
        this.aircraftItems.forEach(aircraft => {
            if(aircraft.isObservedBy(observer)){
                if(!listOfAircrafts.some(x => x === aircraft.aircraftIdentifier.aircraftCertificateName)){
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
    const [pilotageStatusList, setPilotageStatusList] = useState<PilotageStatusViewModel>( new PilotageStatusViewModel(props.aircraftStates));

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
                if(!pilotageStatusList.isControlling(statusMsg.aircraftCertificateName)){
                    pilotageStatusList.insertControlInformation(identifier);
                    setPilotageStatusList({...pilotageStatusList});
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
                                        label={pilotageStatusList.isControlRequestAvailable(data.aircraftIdentifier.aircraftCertificateName) ? 'Take Control' : 'Under Control'}
                                        name={data.aircraftIdentifier.aircraftCertificateName}
                                        type="checkbox"
                                        disabled={aircraftListItems.hasController(data.aircraftIdentifier.aircraftCertificateName) || !props.user.isPilot}
                                        id={data.aircraftIdentifier.aircraftName + "inline" + index}
                                        checked={pilotageStatusList.isControlling(data.aircraftIdentifier.aircraftCertificateName)}
                                        onChange={(e) => {
                                            pilotageStatusList.toggleControlInformation(data.aircraftIdentifier);
                                            setPilotageStatusList({...pilotageStatusList});
                                        }}
                                    />
                                </td>
                                <td>
                                    <Form.Check
                                        label={!pilotageStatusList.isObserving(data.aircraftIdentifier.aircraftCertificateName) ? 'Request Observe' : 'Give up Observing'}
                                        name={data.aircraftIdentifier.aircraftName}
                                        disabled={pilotageStatusList.isControlling(data.aircraftIdentifier.aircraftCertificateName)}
                                        type="checkbox"
                                        id={data.aircraftIdentifier.aircraftName + "inline" + index}
                                        checked={pilotageStatusList.isObserving(data.aircraftIdentifier.aircraftCertificateName)}
                                        onChange={(e) => {
                                            pilotageStatusList.toggleObserveInformation(data.aircraftIdentifier);
                                            setPilotageStatusList({...pilotageStatusList});
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
                    props.onCloseModal(false, pilotageStatusList.pilotageStates);
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
