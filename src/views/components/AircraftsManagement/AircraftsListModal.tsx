import {useEffect, useState} from "react";
import {Button, Modal, Table, Form} from "react-bootstrap";
import {PubSubEvent, removeEvent, subscribeEvent} from "../../../utils/PubSubService";

type AircraftsListModalProps = {
    show: boolean;
    onCloseModal: (isCancelled: boolean, aircraftNames: any) => void;
}

const AircraftsListModal = (props: AircraftsListModalProps) => {
    const [aircraft, setAircraft] = useState([
        {
            name: 'dev1',
            controlling: false
        }, {
            name: 'dev2',
            controlling: false
        }, {
            name: 'dev3',
            controlling: false
        }, {
            name: 'dev4',
            controlling: false
        }, {
            name: 'dev5',
            controlling: false
        }, {
            name: 'dev6',
            controlling: false
        }, {
            name: 'dev7',
            controlling: false
        }
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
                if (aircraft[index].name == data) {
                    aircraft[index].controlling = true
                    setAircraft(aircraft)
                    //console.log(aircraft)
                }
            });


        });


    }

    useEffect(() => {
        subscribeEvent(PubSubEvent.AnyAircraftStatusMessageReceived, onAircraftStatusReceived);
        subscribeEvent(PubSubEvent.AnyUserStatusMessageReceived, onUserStatusReceived);
        return () => {
            removeEvent(PubSubEvent.AnyUserStatusMessageReceived, onUserStatusReceived);
            removeEvent(PubSubEvent.AnyAircraftStatusMessageReceived, onAircraftStatusReceived);
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
                                        checked={(data.controlling == true ? true : false)}
                                        onChange={(e) => {
                                            console.log(aircraft)
                                            aircraft[index].controlling = true;
                                            setAircraft(aircraft);

                                        }}
                                    />
                                </td>
                                <td>
                                    <Form.Check
                                        label="Observing"
                                        name={data.name}
                                        type="radio"
                                        id={data.name + "inline" + index}
                                        checked={(data.controlling == false ? true : false)}
                                        onChange={(e) => {
                                            aircraft[index].controlling = false;
                                            setAircraft(aircraft);
                                        }}
                                    />
                                </td>
                            </tr>
                        );
                    })
                    }
                    </tbody>
                </Table>


                Toggle Connect/Disconnect functionality for all possible aircrafts (dev1, dev2, dev3, dev4, dev5, dev6)
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
