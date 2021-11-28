import React, {useState, useEffect} from 'react';
import {Form, Table, Button, ButtonGroup, Tabs, Tab, Modal} from 'react-bootstrap'


//Component Tab
import WaypointsTab from "./SidebarTabsComp/WaypointsTab";
import GeoFenceTab from "./SidebarTabsComp/GeoFenceTab";
import Failsafe from "./SidebarTabsComp/Failsafe";
import {missionDataType} from "../models/missionTypes";

function WaypointsTable(props: any) {

    let waypointsListArray: any[];

    const [defaultAgl, setDefaultAgl] = useState<number>(400);
    const [isDraft, setIsDraft] = useState(false);
    const [missionData, setMission] = useState<object>({}); //Mission
    const [missionDraft, setMissionDraft] = useState<object>({}); //MissionDraft


    const [waypointsList, setwaypointsList] = useState<any>([]); //CommandList
    const [Draft, setDraft] = useState<any>([]); //CommandList
    const [wayPointCurrent, setwayPointCurrent] = useState<any>(null);
    const [selectedWaypointIndices, setSelectedWaypointIndices] = useState<number[]>([]);
    const [HomeLocation, setHomeLocation] = useState<any>({
        latitude: 0,
        longitude: 0,
        altitude: 0,
    });
    const [waypointEditModal, setwaypointEditModal] = useState(false);
    const [waypointEditModalData, setwaypointEditModalData] = useState<any>();

    const [GeoFenceData, setGeoFenceData] = useState<any>([]);


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

    // @ts-ignore
    const AddWaypoint = ({detail}) => {

        if (detail.isFromDownload == undefined) {
            try {
                debugger
                var a = (missionDraft as any);
                a.waypoints.push({...detail, agl: defaultAgl})
                console.log(a)
                // @ts-ignore
                setMissionDraft(a);

            } catch (e) {
                console.log(e)
            }
            setIsDraft(true);
        }
    };


    // @ts-ignore
    const DownloadMission = ({detail}) => {
        debugger
        setMission(detail);
        setMissionDraft(detail);

    }

    function ClearWaypoint() {
        const newMissionDraft = missionDraft;
        (newMissionDraft as any).waypoints = [];
        setMission(newMissionDraft);
        setIsDraft(true);
    }

    const RemoveWaypoint = (e: { detail: any; }) => {
        // @ts-ignore
        const filteredData = missionDraft.waypoints.filter(({index: index}) => index !== e.detail);
        for (let i = 0; i < filteredData.length; i++) {
            // @ts-ignore
            filteredData[i].index = i;
        }

        var newMissionDraft = missionDraft;
        (newMissionDraft as any).waypoints = filteredData;
        setMission(newMissionDraft);
        //setwaypointsList(filteredData);
        setIsDraft(true);
    };


    // @ts-ignore
    const ChangedWaypoint = (e) => {
        setIsDraft(true);
        try {
            let newComandlistItem = [...waypointsList];
            // @ts-ignore
            newComandlistItem[e.detail.index] = {...e.detail, agl: defaultAgl};
            setwaypointsList(newComandlistItem);
        } catch (e) {
            console.log(e)
        }
    };

    // @ts-ignore
    const setwayPoint = (e) => {
        if (e.detail.waypoint) {
            setwayPointCurrent({
                ...e.detail.waypoint,
                commandSource: e.detail.waypoint.index,
            })
        }
    };

    // @ts-ignore
    const WaypointSelectionChanged = (e) => {
        // console.log("WaypointSelectionChanged: ", e.detail);
        setSelectedWaypointIndices(e.detail);
    };


    const onWaypointClick = (index: number) => {
        if (index < 0 || !waypointsList[index]) return;
        if (selectedWaypointIndices.indexOf(index) >= 0)
            props.mapWindow.csharp.deselectWaypoint(index);
        else
            props.mapWindow.csharp.selectWaypoint(index);
    };

    // @ts-ignore
    const GeoFenceChanged = (data) => {
        //console.log(data.detail)
        setGeoFenceData(data.detail);
    }

    useEffect(() => {
        props.mapWindow.addEventListener("WaypointAdded", AddWaypoint);
        props.mapWindow.addEventListener("WaypointChanged", ChangedWaypoint);
        props.mapWindow.addEventListener("WaypointsCleared", ClearWaypoint);
        props.mapWindow.addEventListener("WaypointRemoved", RemoveWaypoint);

        props.mapWindow.addEventListener("CurrentWaypointChanged", setwayPoint);
        props.mapWindow.addEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
        props.mapWindow.addEventListener("editWaypoint", WaypointEditAction);
        props.mapWindow.addEventListener("GeoFenceChanged", GeoFenceChanged);
        props.mapWindow.addEventListener("DownloadMission", DownloadMission);
        return () => {
            props.mapWindow.removeEventListener("WaypointAdded", AddWaypoint);
            props.mapWindow.removeEventListener("WaypointChanged", ChangedWaypoint);
            props.mapWindow.removeEventListener("WaypointsCleared", ClearWaypoint);
            props.mapWindow.removeEventListener("WaypointRemoved", RemoveWaypoint);

            props.mapWindow.removeEventListener("CurrentWaypointChanged", setwayPoint);
            props.mapWindow.removeEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
            props.mapWindow.removeEventListener("editWaypoint", WaypointEditAction);
            props.mapWindow.removeEventListener("GeoFenceChanged", GeoFenceChanged);
            props.mapWindow.removeEventListener("DownloadMission", DownloadMission);
        };
    });


    const WaypointEditAction = (data: any) => {
        setwaypointEditModal(true);
        if (!data.detail) setwaypointEditModalData(data);

        if (data.detail) {
            data.detail.agl = waypointsList[data.detail.index].agl;
            setwaypointEditModalData(data.detail);
        }
    }


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
                        <Form.Control size="sm" type="text" placeholder="Latitude" onChange={(e) => {
                            setwaypointEditModalData({...waypointEditModalData, latitude: e.target.value});
                        }} value={waypointEditModalData.latitude}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Longitude</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Longitude"
                                      onChange={(e) => {
                                          setwaypointEditModalData({
                                              ...waypointEditModalData,
                                              longitude: e.target.value
                                          });
                                      }}
                                      value={waypointEditModalData.longitude}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Altitude</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                            setwaypointEditModalData({...waypointEditModalData, altitude: parseInt(e.target.value)});
                        }} value={waypointEditModalData.altitude}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Agl</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                            setwaypointEditModalData({...waypointEditModalData, agl: parseInt(e.target.value)});
                            /*var data = waypointsList;
                            data[waypointEditModalData.index].agl = parseInt(e.target.value);
                            setwaypointsList(data)*/
                            console.log(waypointsList[waypointEditModalData.index])
                        }} value={waypointEditModalData.agl}/>
                    </Form.Group>

                    <hr/>
                    <div className={"border p-3"}>
                        <legend
                            style={{position: "relative", top: "-1.6em", fontSize: "18px", marginLeft: "1em"}}>Waypoint
                        </legend>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Speed</Form.Label>
                            <Form.Select aria-label="Default select example"
                                         value={waypointEditModalData.parameter.airspeedSetPoint}
                                         onChange={(e: any) => {
                                             var newAirspeedWaypoint = waypointEditModalData;
                                             newAirspeedWaypoint.parameter.airspeedSetPoint = (parseInt(e.target.value));
                                             setwaypointEditModalData(newAirspeedWaypoint);
                                         }}>
                                <option value="0">Default</option>
                                <option value="1">Low</option>
                                <option value="2">High</option>
                                <option value="3">Rush</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Check
                                type="checkbox"
                                id={"default-1"}
                                checked={(waypointEditModalData.parameter.followTrack)}
                                label={"Follow Track"}
                                onChange={(e: any) => {
                                    var newAirspeedWaypoint = waypointEditModalData;
                                    newAirspeedWaypoint.parameter.followTrack = (e.target.checked);
                                    setwaypointEditModalData(newAirspeedWaypoint);
                                }}
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
                                    var newAirspeedWaypoint = waypointEditModalData;
                                    newAirspeedWaypoint.command = 'WayPoint';
                                    setwaypointEditModalData(newAirspeedWaypoint);
                                }}
                            />
                            <Form.Check
                                label="For Turns"
                                name="command"
                                type="radio"
                                id={"inline2"}
                                style={{width: "200px", float: "left"}}
                                checked={(waypointEditModalData.command == 'LoiterTurns' ? true : false)}
                                onChange={() => {
                                    var newAirspeedWaypoint = waypointEditModalData;
                                    newAirspeedWaypoint.command = 'LoiterTurns'
                                    setwaypointEditModalData(newAirspeedWaypoint);
                                }}
                            />

                            <Form.Group style={{width: "200px", float: "left"}} className="mb-3"
                                        controlId="loiterTurns">
                                <Form.Control size="sm" type="text" placeholder="Index"
                                              disabled={(waypointEditModalData.command == 'LoiterTurns' ? false : true)}
                                              onChange={(e) => {
                                                  console.log(e.target.value)
                                                  var newAirspeedWaypoint = waypointEditModalData;
                                                  newAirspeedWaypoint.parameter.loiterTurns = (parseInt(e.target.value));
                                                  setwaypointEditModalData(newAirspeedWaypoint);
                                              }} value={waypointEditModalData.parameter.loiterTurns}/>
                            </Form.Group>

                            <br/>
                            <br/>

                            <Form.Check
                                style={{width: "200px", float: "left"}}
                                label="For Minutes"
                                name="command"
                                type="radio"
                                id={"inline2"}
                                checked={(waypointEditModalData.command == 'LoiterTime' ? true : false)}
                                onChange={() => {
                                    var newAirspeedWaypoint = waypointEditModalData;
                                    newAirspeedWaypoint.command = 'LoiterTime'
                                    setwaypointEditModalData(newAirspeedWaypoint);
                                }}
                            />

                            <Form.Group style={{width: "200px", float: "left"}} className="mb-3"
                                        controlId="loiterMinutes">
                                <Form.Control size="sm" type="text" placeholder="Index"
                                              disabled={(waypointEditModalData.command == 'LoiterTime' ? false : true)}
                                              onChange={(e) => {
                                                  console.log(e.target.value)
                                                  var newAirspeedWaypoint = waypointEditModalData;
                                                  newAirspeedWaypoint.parameter.loiterMinutes = (parseInt(e.target.value));
                                                  setwaypointEditModalData(newAirspeedWaypoint);
                                              }} value={waypointEditModalData.parameter.loiterMinutes}/>
                            </Form.Group>

                            <br/>
                            <br/>


                            <Form.Check
                                label="Until Altitude"
                                name="command"
                                type="radio"
                                id={"inline2"}
                                checked={(waypointEditModalData.command == 'LoiterAltitude' ? true : false)}
                                onChange={() => {
                                    var newAirspeedWaypoint = waypointEditModalData;
                                    newAirspeedWaypoint.command = 'LoiterAltitude'
                                    setwaypointEditModalData(newAirspeedWaypoint);
                                }}
                            />

                            <Form.Check
                                label="Unlimited"
                                name="command"
                                type="radio"
                                id={"inline2"}
                                checked={(waypointEditModalData.command == 'LoiterUnlimited' ? true : false)}
                                onChange={() => {
                                    var newAirspeedWaypoint = waypointEditModalData;
                                    newAirspeedWaypoint.command = 'LoiterUnlimited';
                                    setwaypointEditModalData(newAirspeedWaypoint);
                                }}
                            />


                        </Form.Group>


                    </div>


                </Modal.Body>
                <Modal.Footer>

                    <Button variant={"success"} onClick={() => {
                        console.log(waypointEditModalData)
                    }}>Parameter</Button>

                    <Button variant={"success"} onClick={() => {
                        console.log(waypointEditModalData)
                        setwayPoint({detail: waypointEditModalData});
                        props.mapWindow.csharp.setWaypoint(waypointEditModalData.index, waypointEditModalData.command, waypointEditModalData.latitude, waypointEditModalData.longitude, waypointEditModalData.altitude, waypointEditModalData.parameter);
                        props.mapWindow.csharp.updateWaypoint(waypointEditModalData);
                        //console.log(waypointEditModalData)
                        setwaypointEditModal(false)
                    }}>Ok</Button>
                    <Button onClick={() => {
                        setwaypointEditModal(false)
                    }}>Cancel</Button>
                </Modal.Footer>
            </Modal>}


            {(missionData as any).waypoints &&
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Source</th>
                    <th>Index</th>
                    <th>Command</th>
                    <th style={{width: "150px"}}>Latitude</th>
                    <th style={{width: "150px"}}>Longitude</th>
                    <th>Altitude</th>
                    <th>Parameter</th>
                    <th>
                        <button onClick={() => {
                            // @ts-ignore
                            //console.log(missionData.waypoints)
                            console.log(missionDraft)
                        }}>Draft Data
                        </button>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{CommandSourceType[wayPointCurrent?.commandSource]}</td>
                    <td>{(wayPointCurrent?.commandSource)}</td>
                    <td>{wayPointCurrent?.command}</td>
                    <td>{wayPointCurrent?.latitude.toFixed(7)}</td>
                    <td>{wayPointCurrent?.longitude.toFixed(7)}</td>
                    <td>{wayPointCurrent?.altitude.toFixed(0)}</td>
                    <td>{wayPointCurrent?.parameter.toString()}</td>
                </tr>
                </tbody>
            </Table>}


            <Tabs defaultActiveKey="waypoints" transition={false} id="noanim-tab-example" className="mb-3">

                <Tab eventKey="waypoints" title="Waypoints">
                    <WaypointsTab
                        missionData={missionData as missionDataType}
                        homeLocation={HomeLocation}
                        currentMissionIndex={wayPointCurrent}
                        defaultAgl={defaultAgl}
                        setDefaultAgl={setDefaultAgl}
                        WaypointEditAction={(e: any) => {
                            WaypointEditAction(e);
                        }}
                        onWaypointClick={onWaypointClick}
                        selectedWaypointIndices={selectedWaypointIndices}
                        jumpToWaypoint={
                            (index: number) => {
                                props.mapWindow.csharp.jumpToWaypoint(index)
                            }
                        }
                        clearWaypoints={() => {
                            props.mapWindow.csharp.clearWaypoints()
                        }
                        }
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
                    <Failsafe
                        csharp={props.mapWindow.csharp}
                    />
                </Tab>
                <Tab eventKey="RcCommands" title="Rc Commands">
                    Rc Commands
                </Tab>
            </Tabs>
        </div>


    );
}


export default WaypointsTable;
