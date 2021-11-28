import React, {useState, useEffect} from 'react';
import {Form, Table, Button, ButtonGroup, Tabs, Tab, Modal} from 'react-bootstrap'


const waypointModal = (props: any) => {
    return (
        <Modal
            show={props.waypointEditModal}
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
                                  value={props.waypointEditModalData?.index}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Latitude" onChange={(e) => {
                        props.setwaypointEditModalData({...props.waypointEditModalData, latitude: e.target.value});
                    }} value={props.waypointEditModalData?.latitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Longitude"
                                  onChange={(e) => {
                                      props.setwaypointEditModalData({
                                          ...props.waypointEditModalData,
                                          longitude: e.target.value
                                      });
                                  }}
                                  value={props.waypointEditModalData?.longitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Altitude</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                        props.setwaypointEditModalData({
                            ...props.waypointEditModalData,
                            altitude: parseInt(e.target.value)
                        });
                    }} value={props.waypointEditModalData?.altitude}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Agl</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Index" onChange={(e) => {
                        props.setwaypointEditModalData({...props.waypointEditModalData, agl: parseInt(e.target.value)});
                        /*var data = waypointsList;
                        data[waypointEditModalData.index].agl = parseInt(e.target.value);
                        setwaypointsList(data)*/
                        console.log(props.waypointsList[props.waypointEditModalData?.index])
                    }} value={props.waypointEditModalData?.agl}/>
                </Form.Group>

                <hr/>
                <div className={"border p-3"}>
                    <legend
                        style={{position: "relative", top: "-1.6em", fontSize: "18px", marginLeft: "1em"}}>Waypoint
                    </legend>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Speed</Form.Label>
                        <Form.Select aria-label="Default select example"
                                     value={props.waypointEditModalData?.parameter?.airspeedSetPoint}
                                     onChange={(e: any) => {
                                         var newAirspeedWaypoint = props.waypointEditModalData;
                                         //newAirspeedWaypoint?.parameter?.airspeedSetPoint = (parseInt(e.target.value));
                                         props.setwaypointEditModalData(newAirspeedWaypoint);
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
                            checked={(props.waypointEditModalData?.parameter?.followTrack)}
                            label={"Follow Track"}
                            onChange={(e: any) => {
                                var newAirspeedWaypoint = props.waypointEditModalData;
                                //newAirspeedWaypoint?.parameter?.followTrack = (e.target.checked);
                                props.setwaypointEditModalData(newAirspeedWaypoint);
                            }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">

                        <Form.Check
                            label="Visit Only"
                            name="command"
                            type="radio"
                            id={"inline1"}
                            checked={(props.waypointEditModalData?.command == 'WayPoint' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointEditModalData;
                                newAirspeedWaypoint.command = 'WayPoint';
                                props.setwaypointEditModalData(newAirspeedWaypoint);
                            }}
                        />
                        <Form.Check
                            label="For Turns"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            style={{width: "200px", float: "left"}}
                            checked={(props.waypointEditModalData?.command == 'LoiterTurns' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointEditModalData;
                                newAirspeedWaypoint.command = 'LoiterTurns'
                                props.setwaypointEditModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Group style={{width: "200px", float: "left"}} className="mb-3"
                                    controlId="loiterTurns">
                            <Form.Control size="sm" type="text" placeholder="Index"
                                          disabled={(props.waypointEditModalData?.command == 'LoiterTurns' ? false : true)}
                                          onChange={(e) => {
                                              console.log(e.target.value)
                                              var newAirspeedWaypoint = props.waypointEditModalData;
                                              newAirspeedWaypoint.parameter.loiterTurns = (parseInt(e.target.value));
                                              props.setwaypointEditModalData(newAirspeedWaypoint);
                                          }} value={props.waypointEditModalData?.parameter.loiterTurns}/>
                        </Form.Group>

                        <br/>
                        <br/>

                        <Form.Check
                            style={{width: "200px", float: "left"}}
                            label="For Minutes"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.waypointEditModalData?.command == 'LoiterTime' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointEditModalData;
                                newAirspeedWaypoint.command = 'LoiterTime'
                                props.setwaypointEditModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Group style={{width: "200px", float: "left"}} className="mb-3"
                                    controlId="loiterMinutes">
                            <Form.Control size="sm" type="text" placeholder="Index"
                                          disabled={(props.waypointEditModalData?.command == 'LoiterTime' ? false : true)}
                                          onChange={(e) => {
                                              console.log(e.target.value)
                                              var newAirspeedWaypoint = props.waypointEditModalData;
                                              newAirspeedWaypoint.parameter.loiterMinutes = (parseInt(e.target.value));
                                              props.setwaypointEditModalData(newAirspeedWaypoint);
                                          }} value={props.waypointEditModalData?.parameter.loiterMinutes}/>
                        </Form.Group>

                        <br/>
                        <br/>


                        <Form.Check
                            label="Until Altitude"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.waypointEditModalData?.command == 'LoiterAltitude' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointEditModalData;
                                //newAirspeedWaypoint?.command = 'LoiterAltitude'
                                props.setwaypointEditModalData(newAirspeedWaypoint);
                            }}
                        />

                        <Form.Check
                            label="Unlimited"
                            name="command"
                            type="radio"
                            id={"inline2"}
                            checked={(props.waypointEditModalData?.command == 'LoiterUnlimited' ? true : false)}
                            onChange={() => {
                                var newAirspeedWaypoint = props.waypointEditModalData;
                                //newAirspeedWaypoint?.command = 'LoiterUnlimited';
                                props.setwaypointEditModalData(newAirspeedWaypoint);
                            }}
                        />


                    </Form.Group>


                </div>


            </Modal.Body>
            <Modal.Footer>

                <Button variant={"success"} onClick={() => {
                    console.log(props.waypointEditModalData)
                }}>Parameter</Button>

                <Button variant={"success"} onClick={() => {
                    console.log(props.waypointEditModalData)
                    props.setwayPoint({detail: props.waypointEditModalData});
                    props.mapWindow.csharp.setWaypoint(props.waypointEditModalData.index, props.waypointEditModalData.command, props.waypointEditModalData.latitude, props.waypointEditModalData.longitude, props.waypointEditModalData.altitude, props.waypointEditModalData.parameter);
                    props.mapWindow.csharp.updateWaypoint(props.waypointEditModalData);
                    //console.log(waypointEditModalData)
                    props.setwaypointEditModal(false)
                }}>Ok</Button>
                <Button onClick={() => {
                    props.setwaypointEditModal(false)
                }}>Cancel</Button>
            </Modal.Footer>
        </Modal>);
}

export default waypointModal;
