import React, {useState, useEffect} from 'react';
import {Form, Table, Button, ButtonGroup, Tabs, Tab, Modal} from 'react-bootstrap'
import {missionDataType} from "../models/missionTypes";

type waypointModalType = {
    waypointModalStatus: boolean;
    setwaypointModalData: any;
    missionDraft: missionDataType;
    waypointModalData: any;
    setwaypointModalStatus: (val: boolean) => void;
    mapWindow: any;
}

const waypointModal = (props: any) => {
    return (
        <Modal
            show={props.waypointModalStatus}
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
                                  value={props.waypointModalData?.index}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Latitude" onChange={(e) => {
                        props.setwaypointModalData({...props.waypointModalData, latitude: e.target.value});
                    }} value={props.waypointModalData?.latitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Longitude"
                                  onChange={(e) => {
                                      props.setwaypointModalData({
                                          ...props.waypointModalData,
                                          longitude: e.target.value
                                      });
                                  }}
                                  value={props.waypointModalData?.longitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Altitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                        props.setwaypointModalData({
                            ...props.waypointModalData,
                            altitude: parseInt(e.target.value)
                        });
                    }} value={props.waypointModalData?.altitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Agl</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                        props.setwaypointModalData({...props.waypointModalData, agl: parseInt(e.target.value)});
                        var data = props.missionDraft;
                        /*data[props.setwaypointModalData.index].agl = parseInt(e.target.value);
                        props.setwaypointsList(data)
                        console.log(props.missionDraft[props.setwaypointModalData?.index])*/
                    }} value={props.waypointModalData?.agl}/>
                </Form.Group>

                <hr/>
                <div className={"border p-3"}>
                    <legend
                        style={{position: "relative", top: "-1.6em", fontSize: "18px", marginLeft: "1em"}}>Waypoint
                    </legend>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Speed</Form.Label>
                        <Form.Select aria-label="Default select example"
                                     value={props.waypointModalData?.parameter?.airspeedSetPoint}
                                     onChange={(e: any) => {
                                         var newAirspeedWaypoint = props.waypointModalData;
                                         newAirspeedWaypoint.parameter.airspeedSetPoint = (parseInt(e.target.value));
                                         props.setwaypointModalData(newAirspeedWaypoint);
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
                            checked={(props.waypointModalData?.parameter?.followTrack)}
                            label={"Follow Track"}
                            onChange={(e: any) => {
                                var newAirspeedWaypoint = props.waypointModalData;
                                newAirspeedWaypoint.parameter.followTrack = (e.target.checked);
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">

                        <Form.Check
                            label="Visit Only"
                            name="command"
                            type="radio"
                            id={"inline1"}
                            checked={(props.waypointModalData?.command == 'WayPoint' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointModalData;
                                newAirspeedWaypoint.command = 'WayPoint';
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />
                        <Form.Check
                            label="For Turns"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            style={{width: "200px", float: "left"}}
                            checked={(props.waypointModalData?.command == 'LoiterTurns' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointModalData;
                                newAirspeedWaypoint.command = 'LoiterTurns'
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Group style={{width: "200px", float: "left"}} className="mb-3"
                                    controlId="loiterTurns">
                            <Form.Control size="sm" type="text" placeholder="Index"
                                          disabled={(props.waypointModalData?.command == 'LoiterTurns' ? false : true)}
                                          onChange={(e) => {
                                              console.log(e.target.value)
                                              var newAirspeedWaypoint = props.waypointModalData;
                                              newAirspeedWaypoint.parameter.loiterTurns = (parseInt(e.target.value));
                                              props.setwaypointModalData(newAirspeedWaypoint);
                                          }} value={props.waypointModalData?.parameter.loiterTurns}/>
                        </Form.Group>

                        <br/>
                        <br/>

                        <Form.Check
                            style={{width: "200px", float: "left"}}
                            label="For Minutes"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.waypointModalData?.command == 'LoiterTime' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointModalData;
                                newAirspeedWaypoint.command = 'LoiterTime'
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Group style={{width: "200px", float: "left"}} className="mb-3"
                                    controlId="loiterMinutes">
                            <Form.Control size="sm" type="text" placeholder="Index"
                                          disabled={(props.waypointModalData?.command == 'LoiterTime' ? false : true)}
                                          onChange={(e) => {
                                              console.log(e.target.value)
                                              var newAirspeedWaypoint = props.waypointModalData;
                                              newAirspeedWaypoint.parameter.loiterMinutes = (parseInt(e.target.value));
                                              props.setwaypointModalData(newAirspeedWaypoint);
                                          }} value={props.waypointModalData?.parameter.loiterMinutes}/>
                        </Form.Group>

                        <br/>
                        <br/>


                        <Form.Check
                            label="Until Altitude"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.waypointModalData?.command == 'LoiterAltitude' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointModalData;
                                newAirspeedWaypoint.command = 'LoiterAltitude'
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Check
                            label="Unlimited"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.waypointModalData?.command == 'LoiterUnlimited' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointModalData;
                                newAirspeedWaypoint.command = 'LoiterUnlimited';
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />


                    </Form.Group>


                </div>


            </Modal.Body>
            <Modal.Footer>

                <Button variant={"success"} onClick={() => {
                    console.log(props.waypointModalData)
                }}>Parameter</Button>

                <Button variant={"success"} onClick={() => {
                    console.log(props.waypointModalData)
                    //props.setwayPoint({detail: props.setwaypointModalData});
                    props.mapWindow.csharp.setWaypoint(props.waypointModalData.index, props.waypointModalData.command, props.waypointModalData.latitude, props.waypointModalData.longitude, props.waypointModalData.altitude, props.waypointModalData.parameter);
                    props.mapWindow.csharp.updateWaypoint(props.waypointModalData);
                    //console.log(setwaypointModalData)
                    props.setwaypointModalStatus(false)
                }}>Ok</Button>
                <Button onClick={() => {
                    props.setwaypointModalStatus(false)
                }}>Cancel</Button>
            </Modal.Footer>
        </Modal>);
}

export default waypointModal;
