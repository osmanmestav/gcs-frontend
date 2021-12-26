import {useEffect, useState} from "react";
import {Button, Modal, Table, Form} from "react-bootstrap";
import {PubSubEvent, removeEvent, subscribeEvent} from "../../../utils/PubSubService";

type AircraftsListModalProps = {
    show: boolean;
    aircraftStates: AircraftPilotageStatus[];
    onCloseModal: (isCancelled: boolean, aircraftNames: AircraftPilotageStatus[]) => void;
};

export class AircraftPilotageStatus {
    constructor(name: string, isControlling: boolean){
        this.name = name;
        this.controlling = isControlling;
    };
    name: string;
    controlling: boolean; 
};

const AircraftsListModal = (props: AircraftsListModalProps) => {
    const [aircraft, setAircraft] = useState<AircraftPilotageStatus[]>([
        new AircraftPilotageStatus('dev1', false),
        new AircraftPilotageStatus('dev2', false),
        new AircraftPilotageStatus('dev3', false),
        new AircraftPilotageStatus('dev4', false),
        new AircraftPilotageStatus('dev5', false),
        new AircraftPilotageStatus('dev6', false),
    ]);


    const onAircraftStatusReceived = (args: any[]) => {
        console.log(args[0]);
    }

    const onUserStatusReceived = (args: any[]) => {

        args.forEach((arg) => {

            arg.listOfControllingAircrafts.forEach((data: any) => {
                var index = aircraft.map(function (e) {
                    return e.name;
                }).indexOf(data);
                if (aircraft[index].name === data) {
                    // burada bunu set etmeyeceksin. Bu bilgiyi ObservedBy icin kullanacaksin
                    // controlun kimin tarafindan yapildigini aircraftStatus ten alacaksin.
                    // aircraft[index].controlling props olarak gelmeli - ve sadece component mount oldugu zaman set edilmeli. props olarak koyuyorum.
                    // aircraft[index].controlling = true
                    setAircraft(aircraft)
                    //console.log(aircraft)
                }
            });
        });
    }

    useEffect(() => {
        props.aircraftStates.forEach(x=> {
            let index = aircraft.findIndex(y=> y.name === x.name);
            if(index !== -1){
                aircraft[index].controlling = true;
            }
        });
        setAircraft([...aircraft]);

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
                    {aircraft &&
                    aircraft.map((data, index) => {
                        return (
                            <tr key={index}>
                                <td>{(index + 1)}</td>
                                <td>{data.name}</td>
                                <td>{data.name}</td>
                                <td>{data.name}</td>
                                <td>
                                    <Form.Check
                                        inline
                                        label="Controlling"
                                        name={data.name}
                                        type="radio"
                                        disabled={data.controlling}
                                        id={data.name + "inline" + index}
                                        checked={(data.controlling === true ? true : false)}
                                        onChange={(e) => {
                                            console.log(aircraft)
                                            aircraft[index].controlling = true;
                                            setAircraft([...aircraft]);

                                        }}
                                    />
                                </td>
                                <td>
                                    <Form.Check
                                        label="Observing"
                                        name={data.name}
                                        type="radio"
                                        id={data.name + "inline" + index}
                                        checked={(data.controlling === false ? true : false)}
                                        onChange={(e) => {
                                            aircraft[index].controlling = false;
                                            setAircraft([...aircraft]);
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
                    props.onCloseModal(false, aircraft);
                }}>
                    Ok
                </Button>
                <Button onClick={() => {
                    props.onCloseModal(true, []);
                }}>
                    Cancel
                </Button>
                <Button onClick={() => {
                    console.log(aircraft)
                }}>
                    Aircraft Data
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AircraftsListModal;
