import {useEffect, useState} from "react";
import {Button, Modal, Table, Form} from "react-bootstrap";
import {PubSubEvent, removeEvent, subscribeEvent} from "../../../utils/PubSubService";

type AircraftsListModalProps = {
    userCode: string;
    show: boolean;
    aircraftStates: AircraftPilotageStatus[];
    onCloseModal: (isCancelled: boolean, aircraftNames: AircraftPilotageStatus[]) => void;
};

export enum PilotageState {
    None,
    Observing,
    Controlling
};

export class AircraftPilotageStatus {
    constructor(name: string, state: PilotageState) {
        this.name = name;
        this.state = state;
    };

    name: string;
    state: PilotageState;

    isObserving = () => {
        return (this.state === PilotageState.Observing || this.state === PilotageState.Controlling ? true : false);
    };

    isControlling = () => {
        return this.state === PilotageState.Controlling;
    };
};


/**
 * string name: aircraft name
 * enum userState: aircraft control status
 * string controller pilot name / Controlling By
 * string Array observers: pilot observers list / Observing By
 */
class AircraftsListItemViewModel {
    constructor(name: string, aircraftName: string, userState: PilotageState, controller: string) {
        this.name = name;
        this.aircraftName = aircraftName;
        this.state = userState;
        this.controller = controller;
        this.observers = [];
    }

    name: string;
    aircraftName: string;
    controller: string;
    observers: string[];
    state: PilotageState;

    isCLaimingDisabled = (userCode: string, type: string = 'control') => {
        if (type === 'control') return (this.state === PilotageState.Controlling ? true : false)
        if (type === 'obverse') return (this.state === PilotageState.Controlling && userCode !== this.controller ? false : true)
    };

    extractAirraftPilotageStatus = (userCode: string) => {
        if (this.controller === userCode) {
            return new AircraftPilotageStatus(this.name, PilotageState.Controlling);
        } else if (this.observers.some(x => x === userCode)) {
            return new AircraftPilotageStatus(this.name, PilotageState.Observing);
        } else
            return null;
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

    any = (aircraftCertificateName: string) => {
        const list = this.aircraftItems.filter(x => x.name === aircraftCertificateName);
        return list.length > 0;
    };

    extractAirraftPilotageStatus = (userCode: string) => {
        return this.aircraftItems.map(x => x.extractAirraftPilotageStatus(userCode))
            .filter(x => x !== null).map(x => x!);
    };

    insert = (data: any) => {
        if (this.any(data.aircraftCertificateName))
            return false;
        // @ts-ignore
        var userState: number = this.extractAirraftPilotageStatus(data.gcsController.userCode)
        if (data.gcsController.userCode) userState = PilotageState.Controlling;
        const aircraft = new AircraftsListItemViewModel(data.aircraftCertificateName, data.aircraftName, userState, data.gcsController.userCode);
        this.aircraftItems.push(aircraft);
        return true;
    };

    remove = (aircraftName: string) => {
        if (!this.any(aircraftName))
            return false;
        this.aircraftItems = this.aircraftItems.filter(y => y.aircraftName !== aircraftName);
        return true;
    };

    getAircraftListItem = (aircraftCertificateName: string) => {
        return this.aircraftItems.find(x => x.name == aircraftCertificateName);
    }

}

const AircraftsListModal = (props: AircraftsListModalProps) => {
    const [aircraftListItems, setAircraftListItems] = useState<AircraftsListViewModel>(new AircraftsListViewModel());
    const [aircraftControlList, setAircraftControlList] = useState<AircraftPilotageStatus[]>(props.aircraftStates);

    //Aircraft List
    const onAircraftStatusReceived = (args: any[]) => {


        args.forEach((arg) => {
            console.log(arg)
            if (aircraftListItems.insert(arg) === false) {
                var aircrafItemEdit = aircraftListItems.getAircraftListItem(arg.aircraftCertificateName);
                if (aircrafItemEdit !== undefined) aircrafItemEdit.controller = arg.gcsController.userCode;
            }
        });
        // @ts-ignore
        setAircraftListItems({...aircraftListItems});
    }

    const onUserStatusReceived = (args: any[]) => {
        console.log(args)
        args.forEach((arg) => {
            arg.listOfObservingAircrafts.forEach((data: string) => {
                var index = aircraftListItems.getAircraftItemList().map(function (e) {
                    return e.controller;
                }).indexOf(data);
                if (aircraftListItems.getAircraftItemList()[index].aircraftName === data) {
                    console.log(data)
                    // burada bunu set etmeyeceksin. Bu bilgiyi ObservedBy icin kullanacaksin
                    // controlun kimin tarafindan yapildigini aircraftListItemsStatus ten alacaksin.
                    // aircraftListItems[index].controlling props olarak gelmeli - ve sadece component mount oldugu zaman set edilmeli. props olarak koyuyorum.
                    aircraftListItems.getAircraftItemList()[index].observers.push(data)
                    // @ts-ignore
                    setAircraftListItems({...aircraftListItems});
                }
            });
        });
    }

    useEffect(() => {
        console.log(props.aircraftStates)
        props.aircraftStates.forEach(x => {
            let index = aircraftListItems.getAircraftItemList().findIndex(y => y.name === x.name);
            if (index !== -1) {
                aircraftListItems.getAircraftItemList()[index].state = PilotageState.Controlling;
            }
        });
        // @ts-ignore
        setAircraftListItems({...aircraftListItems});

    }, [props.aircraftStates]);

    useEffect(() => {
        subscribeEvent(PubSubEvent.AnyAircraftStatusMessageReceived, onAircraftStatusReceived);
        subscribeEvent(PubSubEvent.AnyUserStatusMessageReceived, onUserStatusReceived);
        return () => {
            removeEvent(PubSubEvent.AnyUserStatusMessageReceived, onUserStatusReceived);
            removeEvent(PubSubEvent.AnyAircraftStatusMessageReceived, onAircraftStatusReceived);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const extractOkInformation = () => {
        return aircraftListItems.extractAirraftPilotageStatus(props.userCode);
    }

    return (
        <Modal
            show={props.show}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Manage Aircrafts (Temporary Logic: To control check Controlling, to give up check Observing)
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Aircraft Name</th>
                        <th>Controlling By</th>
                        <th>Observing By</th>
                        <th>Claim/Control</th>
                        <th>Observe</th>
                    </tr>
                    </thead>
                    <tbody>
                    {aircraftListItems.getAircraftItemList() &&
                    aircraftListItems.getAircraftItemList().map((data, index) => {
                        return (
                            // @ts-ignore
                            <tr key={index}>
                                <td>{(index + 1)}</td>
                                <td>{data.aircraftName + ' / ' + data.name}</td>
                                <td>{data.controller}</td>
                                <td>
                                    {// @ts-ignore
                                        data.observers.map(x => x.controller + ',')
                                    }
                                </td>
                                <td>
                                    <Form.Check
                                        inline
                                        label="Controlling"
                                        name={data.aircraftName}
                                        type="checkbox"
                                        //disabled={data.isCLaimingDisabled(props.userCode)}
                                        id={data.aircraftName + "inline" + index}
                                        checked={(aircraftControlList?.find(x => x.name == data.name)?.isControlling())}
                                        onChange={(e) => {
                                            var aircraft = aircraftControlList?.find(x => x.name == data.name);
                                            if (aircraft !== undefined) {
                                                if (e.target.checked)
                                                    aircraft.state = PilotageState.Controlling;
                                                else
                                                    aircraft.state = PilotageState.None;
                                                // @ts-ignore
                                                setAircraftControlList({...aircraftControlList});
                                            } else {
                                                aircraftControlList?.push(new AircraftPilotageStatus(data.name, PilotageState.Controlling))
                                                setAircraftControlList(aircraftControlList);
                                            }
                                        }}
                                    />
                                </td>
                                <td>
                                    <Form.Check
                                        label="Observing"
                                        name={data.aircraftName}
                                        disabled={data.isCLaimingDisabled(props.userCode, 'obverse')}
                                        type="checkbox"
                                        id={data.aircraftName + "inline" + index}
                                        //checked={(aircraftControlList?.find(x => x.name == data.name)?.isObserving())}
                                        onChange={(e) => {

                                            var aircraft = aircraftControlList?.find(x => x.name == data.name);
                                            if (aircraft !== undefined) {
                                                if (e.target.checked)
                                                    aircraft.state = PilotageState.Observing;
                                                else
                                                    aircraft.state = PilotageState.None;
                                                // @ts-ignore
                                                setAircraftControlList({...aircraftControlList});
                                            } else {
                                                aircraftControlList?.push(new AircraftPilotageStatus(data.name, PilotageState.Observing))
                                                setAircraftControlList(aircraftControlList);
                                            }
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
                    props.onCloseModal(false, aircraftControlList);
                }}>
                    Ok
                </Button>
                <Button onClick={() => {
                    props.onCloseModal(true, []);
                }}>
                    Cancel
                </Button>
                <Button onClick={() => {
                    console.log(extractOkInformation())
                    console.log(props.aircraftStates)
                }}>
                    Aircraft Data
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AircraftsListModal;
