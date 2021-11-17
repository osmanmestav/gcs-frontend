import React, {useState, useEffect} from 'react';
import {Form, Table, Button, ButtonGroup, Tabs, Tab, Modal} from 'react-bootstrap'


//Component Tab
import WaypointsTab from "./SidebarTabsComp/WaypointsTab";
import GeoFenceTab from "./SidebarTabsComp/GeoFenceTab";

function WaypointsTable(props: any) {

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

    const [GeoFenceData, setGeoFenceData] = useState<any>([]);


    // @ts-ignore
    const AddWaypoint = ({detail}) => {
        CommandListArray = [];
        CommandListArray.push({...detail, agl: Agl,})
        // @ts-ignore
        setCommandList([...CommandList, ...CommandListArray]);
        setIsDraft(true);

    };

    const CommandSourceType: any = {
        0: "NONE",
        1: "INITIAL",
        2: "MISSION",
        3: "IDLE",
        4: "RC",
        5: "INSTANT",
        6: "GEOFENCE",
        7: "FAILSAFE",
        8: "FAILSAFEFLIGHTCMDONGROUND",
        9: "FAILSAFERESCUE",
        10: "FAILSAFEGPSLOSS",
        11: "FAILSAFEGCSLOSS",
        12: "FAILSAFERCLOSS",
    }

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
    const ChangedWaypoint = (e) => {
        setIsDraft(true);
        try {
            let newComandlistItem = [...CommandList];
            // @ts-ignore
            newComandlistItem[e.detail.index] = {...e.detail, agl: Agl};
            setCommandList(newComandlistItem);
        } catch (e) {
            console.log(e)
        }
    };

    // @ts-ignore
    const setwayPoint = (e) => {
        console.log(e)
        if (e.detail.waypoint) {
            setwayPointCurrent({
                ...e.detail.waypoint,
                commandSource: e.detail.commandSource,
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
    const GeoFenceChanged = (data) => {
        console.log(data.detail)
        setGeoFenceData(data.detail);
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


    const WaypointEditAction = (data: any) => {
        setwaypointEditModal(true);
        if (!data.detail) setwaypointEditModalData(data);

        if (data.detail) {
            data.detail.agl = CommandList[data.detail.index].agl;
            setwaypointEditModalData(data.detail);
        }
    }


    // @ts-ignore
    return (

        <div>

            {waypointEditModalData &&
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
                        <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                            setwaypointEditModalData({...waypointEditModalData, agl: e.target.value});
                        }} value={waypointEditModalData.agl}/>
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
                        //props.mapWindow.dispatchEvent(new CustomEvent('WaypointChanged', {detail: waypointEditModalData}));
                        setwayPoint({detail: waypointEditModalData});
                        props.mapWindow.csharp.setWaypoint(waypointEditModalData.index, waypointEditModalData.command, waypointEditModalData.latitude, waypointEditModalData.longitude, waypointEditModalData.altitude, waypointEditModalData.parameter);
                        setwaypointEditModal(false)
                    }}>Ok</Button>
                    <Button onClick={() => {
                        setwaypointEditModal(false)
                    }}>Cancel</Button>
                </Modal.Footer>
            </Modal>}


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
                    <td>{CommandSourceType[wayPointCurrent?.commandSource]}</td>
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
                    <WaypointsTab
                        mapWindow={props.mapWindow}
                        HomeLocation={HomeLocation}
                        wayPointCurrent={wayPointCurrent}
                        CommandList={CommandList}
                        Agl={Agl}
                        setsAgl={(e: any) => {
                            setAgl(e.target.value);
                        }}
                        WaypointEditAction={(e: any) => {
                            WaypointEditAction(e);
                        }}
                        WaypointSelectionEdit={(e: any) => {
                            WaypointSelectionEdit(e);
                        }}
                        selectWaypoint={selectWaypoint}
                    />
                </Tab>
                <Tab eventKey="Geofence" title="Geofence">

                    <GeoFenceTab
                        GeoFenceData={GeoFenceData}
                        setGeoFenceActive={(e: any) => {
                            var newGeofence = GeoFenceData;
                            newGeofence.isActive = e.target.checked;
                            setGeoFenceData(newGeofence);
                        }}
                        setGeoFenceVisible={(e: any) => {
                            var newGeofence = GeoFenceData;
                            newGeofence.isVisible = e.target.checked;
                            setGeoFenceData(newGeofence);
                        }}
                    ></GeoFenceTab>
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


export default WaypointsTable;
