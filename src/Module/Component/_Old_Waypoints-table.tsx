import React, {useState, useEffect} from 'react';
import {Form, Table, Button, ButtonGroup, Tabs, Tab, Modal} from 'react-bootstrap'


function _Old_WaypointsTable(props: any) {

    let CommandListArray: any[];

    const [Agl, setAgl] = useState(400);
    const [isDraft, setIsDraft] = useState(false);
    const [CommandList, setCommandList] = useState<any>([]);
    const [wayPointCurrent, setwayPointCurrent] = useState<any>(null);
    const [selectWaypoint, setselectWaypoint] = useState<any>([]);
    const [HomeLocation, setHomeLocation] = useState<any>({
        latitude: 0,
        longitude: 0,
        altitude: 0,
    });
    const [waypointEditModal, setwaypointEditModal] = useState(false);
    const [waypointEditModalData, setwaypointEditModalData] = useState<any>();


    // @ts-ignore
    const AddWaypoint = ({detail}) => {
        CommandListArray = [];

        CommandListArray.push({
            index: detail.index,
            command: detail.command,
            latitude: detail.latitude,
            longitude: detail.longitude,
            altitude: detail.altitude,
            agl: Agl,
        })
        // @ts-ignore
        setCommandList([...CommandList, ...CommandListArray]);
        setIsDraft(true);

    };

    function ClearWaypoint() {
        setCommandList([]);
        setIsDraft(true);
    }

    const RemoveWaypoint = (e: { detail: any; }) => {
        // @ts-ignore
        const filteredData = CommandList.filter(({index: index}) => index !== e.detail);
        for (let i = 0; i < filteredData.length; i++) {
            // @ts-ignore
            filteredData[i].index = i;
        }
        setCommandList(filteredData);
        setIsDraft(true);
    };

    // @ts-ignore
    const SetMapHome = ({detail: {altitude: altitude, latitude: latitude, longitude: longitude}}) => {
        setHomeLocation({latitude: latitude, altitude: altitude, longitude: longitude});
        setIsDraft(true);
    };

    // @ts-ignore
    const ChangedWaypoint = ({detail: {altitude: altitude, command: command, index: index, latitude: latitude, longitude: longitude}}) => {
        setIsDraft(true);
        try {
            let newComandlistItem = [...CommandList];
            // @ts-ignore
            newComandlistItem[index].command = command;
            // @ts-ignore
            newComandlistItem[index].latitude = latitude;
            // @ts-ignore
            newComandlistItem[index].longitude = longitude;
            // @ts-ignore
            newComandlistItem[index].altitude = altitude;
            setCommandList(newComandlistItem);
        } catch (e) {
            console.log(e)
        }
    };

    // @ts-ignore
    const setwayPoint = (e) => {
        if (e.detail.waypoint) {
            setwayPointCurrent({
                commandSource: e.detail.commandSource,
                altitude: e.detail.waypoint.altitude,
                command: e.detail.waypoint.command,
                index: e.detail.waypoint.index,
                latitude: e.detail.waypoint.latitude,
                longitude: e.detail.waypoint.longitude,
            })
        }
    };

    // @ts-ignore
    const WaypointSelectionChanged = (e) => {
        //console.log(e.detail);
        setselectWaypoint(e.detail);
    };


    const WaypointSelectionEdit = (index: any) => {
        //console.log(selectWaypoint?.indexOf(index));
        //props.mapWindow.dispatchEvent(new CustomEvent('WaypointSelectionChanged', {detail: index}));
    };

    // @ts-ignore
    const setsAgl = ({target: {value: value}}) => setAgl(value)

    // @ts-ignore
    const GeoFenceChanged = (data) => {
        console.log(data.detail)
    }

    useEffect(() => {
        props.mapWindow.addEventListener("WaypointAdded", AddWaypoint);
        props.mapWindow.addEventListener("WaypointChanged", ChangedWaypoint);
        props.mapWindow.addEventListener("WaypointsCleared", ClearWaypoint);
        props.mapWindow.addEventListener("WaypointRemoved", RemoveWaypoint);
        props.mapWindow.addEventListener("HomeChanged", SetMapHome);
        props.mapWindow.addEventListener("CurrentWaypointChanged", setwayPoint);
        props.mapWindow.addEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
        props.mapWindow.addEventListener("editWaypoint", WaypointEditAction);
        props.mapWindow.addEventListener("GeoFenceChanged", GeoFenceChanged);
        return () => {
            props.mapWindow.removeEventListener("WaypointAdded", AddWaypoint);
            props.mapWindow.removeEventListener("WaypointChanged", ChangedWaypoint);
            props.mapWindow.removeEventListener("WaypointsCleared", ClearWaypoint);
            props.mapWindow.removeEventListener("WaypointRemoved", RemoveWaypoint);
            props.mapWindow.removeEventListener("HomeChanged", SetMapHome);
            props.mapWindow.removeEventListener("CurrentWaypointChanged", setwayPoint);
            props.mapWindow.removeEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
            props.mapWindow.removeEventListener("editWaypoint", WaypointEditAction);
            props.mapWindow.removeEventListener("GeoFenceChanged", GeoFenceChanged);
        };
    });

    const jumpToWaypoint = (index: any) => {
        props.mapWindow.csharp.jumpToWaypoint(index)
    }


    const WaypointEditAction = (data: any) => {
        setwaypointEditModal(true);
        if (!data.detail) setwaypointEditModalData(data);

        if (data.detail) {
            data.detail.agl = CommandList[data.detail.index].agl;
            setwaypointEditModalData(data.detail);

        }
    }


    const WeypointEdit = () => {
        console.log(waypointEditModalData);
        return (


            <Modal
                show={waypointEditModal}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Waypoint Editor
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Index</Form.Label>
                        <Form.Control size="sm" type="number" disabled placeholder="Index"
                                      value={waypointEditModalData.index}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Latitude</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Index"
                                      value={waypointEditModalData.latitude}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Longitude</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Index"
                                      value={waypointEditModalData.longitude}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Altitude</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Index"
                                      value={waypointEditModalData.altitude.toFixed(7)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Agl</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Index"
                                      value={waypointEditModalData.agl}/>
                    </Form.Group>

                    <hr/>
                    <div className={"border p-3"}>
                        <legend
                            style={{position: "relative", top: "-1.6em", fontSize: "18px", marginLeft: "1em"}}>Waypoint
                        </legend>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Speed</Form.Label>
                            <Form.Select aria-label="Default select example">
                                <option>Default</option>
                                <option value="1">Low</option>
                                <option value="2">High</option>
                                <option value="3">Rush</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Check
                                type="checkbox"
                                id={"default-1"}
                                label={"Follow Track"}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">

                            <Form.Check
                                label="Visit Only"
                                name="command"
                                type="radio"
                                id={"inline1"}
                                checked={(waypointEditModalData.command == 'WayPoint' ? true : false)}
                                onChange={() => {
                                    waypointEditModalData.command = 'WayPoint';
                                    setwaypointEditModalData(waypointEditModalData);
                                }
                                }
                            />
                            <Form.Check
                                label="For Turns"
                                name="command"
                                type="radio"
                                id={"inline2"}
                                checked={(waypointEditModalData.command == 'LoiterTurns' ? true : false)}
                                onChange={() => {
                                    waypointEditModalData.command = 'LoiterTurns'
                                    setwaypointEditModalData(waypointEditModalData);
                                }
                                }
                            />
                            <Form.Check
                                label="For Minutes"
                                name="command"
                                type="radio"
                                id={"inline2"}
                                checked={(waypointEditModalData.command == 'LoiterTime' ? true : false)}
                                onChange={() =>
                                    waypointEditModalData.command = 'LoiterTime'
                                }
                            />

                            <Form.Check
                                label="Until Altitude"
                                name="command"
                                type="radio"
                                id={"inline2"}
                                checked={(waypointEditModalData.command == 'LoiterAltitude' ? true : false)}
                                onChange={() =>
                                    waypointEditModalData.command = 'LoiterAltitude'
                                }
                            />

                            <Form.Check
                                label="Unlimited"
                                name="command"
                                type="radio"
                                id={"inline2"}
                                checked={(waypointEditModalData.command == 'LoiterUnlimited' ? true : false)}
                                onChange={() =>
                                    waypointEditModalData.command = 'LoiterUnlimited'
                                }
                            />

                            <Form.Check
                                label="Return To Launch"
                                name="command"
                                type="radio"
                                id={"inline2"}
                            />


                        </Form.Group>


                    </div>


                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"success"} onClick={() => {
                        setwaypointEditModal(false)
                    }}>Ok</Button>
                    <Button onClick={() => {
                        setwaypointEditModal(false)
                    }}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        )
    }


    // @ts-ignore
    return (

        <div>


            {waypointEditModalData && <WeypointEdit></WeypointEdit>}
            {CommandList &&
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Source</th>
                    <th>Index</th>
                    <th>Command</th>
                    <th style={{width: "150px"}}>Latitude</th>
                    <th style={{width: "150px"}}>Longitude</th>
                    <th>Altitude</th>

                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{wayPointCurrent?.commandSource}</td>
                    <td>{(wayPointCurrent?.index + 1)}</td>
                    <td>{wayPointCurrent?.command}</td>
                    <td>{wayPointCurrent?.latitude.toFixed(7)}</td>
                    <td>{wayPointCurrent?.longitude.toFixed(7)}</td>
                    <td>{wayPointCurrent?.altitude.toFixed(0)}</td>
                </tr>
                </tbody>
            </Table>}


            <Tabs defaultActiveKey="waypoints" transition={false} id="noanim-tab-example" className="mb-3">

                <Tab eventKey="waypoints" title="Waypoints">

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Altitude</th>
                            <th>Altitude Over</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{HomeLocation.latitude.toFixed(7)}</td>
                            <td>{HomeLocation.longitude.toFixed(7)}</td>
                            <td>{HomeLocation.altitude.toFixed(0)}</td>
                            <td><input type="number" value={Agl} onChange={e => setsAgl(e)}/> m</td>
                        </tr>
                        </tbody>
                    </Table>

                    <div style={{height: '260px', overflow: 'scroll'}}>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Command</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>MSL</th>
                                <th>AGL</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {// @ts-ignore
                                CommandList.map((data, index) => {

                                        return (
                                            <tr
                                                onClick={() => {
                                                    WaypointSelectionEdit(index)
                                                }}
                                                key={index}
                                                className={(index == wayPointCurrent?.index ? 'select-red' : '') + (selectWaypoint?.indexOf(index) >= 0 ? ' select-grey' : '')}
                                            >
                                                <td>{(index + 1)}</td>
                                                <td>{data.command}</td>
                                                <td>{data.latitude.toFixed(7)}</td>
                                                <td>{data.longitude.toFixed(7)}</td>
                                                <td>{data.altitude.toFixed(0)} m</td>
                                                <td>{data.agl} m</td>
                                                <td>
                                                    <ButtonGroup aria-label="Basic example" size="sm">
                                                        <Button style={{fontSize: "10px"}} variant="dark" onClick={() => {
                                                            WaypointEditAction(data);
                                                        }}>
                                                            <i className="fa fa-pencil-alt"></i>
                                                        </Button>
                                                        <Button style={{fontSize: "10px"}} variant="secondary"
                                                                onClick={() => {
                                                                    jumpToWaypoint(index)
                                                                }}>jump</Button>
                                                    </ButtonGroup>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>
                        </Table>
                    </div>
                </Tab>
                <Tab eventKey="Geofence" title="Geofence">
                    Geofence
                </Tab>
                <Tab eventKey="Failsafe" title="Failsafe">
                    Failsafe
                </Tab>
                <Tab eventKey="RcCommands" title="Rc Commands">
                    Rc Commands
                </Tab>
            </Tabs>
        </div>


    );
}


export default _Old_WaypointsTable;
