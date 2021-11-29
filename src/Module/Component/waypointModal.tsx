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
                                  value={props.setwaypointModalData?.index}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Latitude" onChange={(e) => {
                        props.setwaypointModalData({...props.setwaypointModalData, latitude: e.target.value});
                    }} value={props.setwaypointModalData?.latitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Longitude"
                                  onChange={(e) => {
                                      props.setwaypointModalData({
                                          ...props.setwaypointModalData,
                                          longitude: e.target.value
                                      });
                                  }}
                                  value={props.setwaypointModalData?.longitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Altitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                        props.setwaypointModalData({
                            ...props.setwaypointModalData,
                            altitude: parseInt(e.target.value)
                        });
                    }} value={props.setwaypointModalData?.altitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Agl</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                        props.setwaypointModalData({...props.setwaypointModalData, agl: parseInt(e.target.value)});
                        var data = props.missionDraft;
                        /*data[props.setwaypointModalData.index].agl = parseInt(e.target.value);
                        props.setwaypointsList(data)
                        console.log(props.missionDraft[props.setwaypointModalData?.index])*/
                    }} value={props.setwaypointModalData?.agl}/>
                </Form.Group>

                <hr/>
                <div className={"border p-3"}>
                    <legend
                        style={{position: "relative", top: "-1.6em", fontSize: "18px", marginLeft: "1em"}}>Waypoint
                    </legend>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Speed</Form.Label>
                        <Form.Select aria-label="Default select example"
                                     value={props.setwaypointModalData?.parameter?.airspeedSetPoint}
                                     onChange={(e: any) => {
                                         var newAirspeedWaypoint = props.setwaypointModalData;
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
                            checked={(props.setwaypointModalData?.parameter?.followTrack)}
                            label={"Follow Track"}
                            onChange={(e: any) => {
                                var newAirspeedWaypoint = props.setwaypointModalData;
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
                            checked={(props.setwaypointModalData?.command == 'WayPoint' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.setwaypointModalData;
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
                            checked={(props.setwaypointModalData?.command == 'LoiterTurns' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.setwaypointModalData;
                                newAirspeedWaypoint.command = 'LoiterTurns'
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Group style={{width: "200px", float: "left"}} className="mb-3"
                                    controlId="loiterTurns">
                            <Form.Control size="sm" type="text" placeholder="Index"
                                          disabled={(props.setwaypointModalData?.command == 'LoiterTurns' ? false : true)}
                                          onChange={(e) => {
                                              console.log(e.target.value)
                                              var newAirspeedWaypoint = props.setwaypointModalData;
                                              newAirspeedWaypoint.parameter.loiterTurns = (parseInt(e.target.value));
                                              props.setwaypointModalData(newAirspeedWaypoint);
                                          }} value={props.setwaypointModalData?.parameter.loiterTurns}/>
                        </Form.Group>

                        <br/>
                        <br/>

                        <Form.Check
                            style={{width: "200px", float: "left"}}
                            label="For Minutes"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.setwaypointModalData?.command == 'LoiterTime' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.setwaypointModalData;
                                newAirspeedWaypoint.command = 'LoiterTime'
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Group style={{width: "200px", float: "left"}} className="mb-3"
                                    controlId="loiterMinutes">
                            <Form.Control size="sm" type="text" placeholder="Index"
                                          disabled={(props.setwaypointModalData?.command == 'LoiterTime' ? false : true)}
                                          onChange={(e) => {
                                              console.log(e.target.value)
                                              var newAirspeedWaypoint = props.setwaypointModalData;
                                              newAirspeedWaypoint.parameter.loiterMinutes = (parseInt(e.target.value));
                                              props.setwaypointModalData(newAirspeedWaypoint);
                                          }} value={props.setwaypointModalData?.parameter.loiterMinutes}/>
                        </Form.Group>

                        <br/>
                        <br/>


                        <Form.Check
                            label="Until Altitude"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.setwaypointModalData?.command == 'LoiterAltitude' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.setwaypointModalData;
                                newAirspeedWaypoint.command = 'LoiterAltitude'
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Check
                            label="Unlimited"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.setwaypointModalData?.command == 'LoiterUnlimited' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.setwaypointModalData;
                                newAirspeedWaypoint.command = 'LoiterUnlimited';
                                props.setwaypointModalData(newAirspeedWaypoint);
                            }}
                        />


                    </Form.Group>


                </div>


            </Modal.Body>
            <Modal.Footer>

                <Button variant={"success"} onClick={() => {
                    console.log(props.setwaypointModalData)
                }}>Parameter</Button>

                <Button variant={"success"} onClick={() => {
                    console.log(props.setwaypointModalData)
                    //props.setwayPoint({detail: props.setwaypointModalData});
                    props.mapWindow.csharp.setWaypoint(props.setwaypointModalData.index, props.setwaypointModalData.command, props.setwaypointModalData.latitude, props.setwaypointModalData.longitude, props.setwaypointModalData.altitude, props.setwaypointModalData.parameter);
                    props.mapWindow.csharp.updateWaypoint(props.setwaypointModalData);
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
