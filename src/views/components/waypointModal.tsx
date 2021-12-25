import clone from 'clone';
import React, {useState} from 'react';
import {Row, Col, Form, Table, Button, ButtonGroup, Modal} from 'react-bootstrap'
import {waypointDataType} from "../viewModels/missionTypes";

type waypointModalType = {
    show: boolean;
    onCloseModal: (saveChanges: boolean, newMission: waypointDataType[] | null) => void;
    editIndex: number;
    missionWaypoints: waypointDataType[];
}

const ModalsWaypoint = (props: waypointModalType) => {

    const [waypointsData, setWaypointsData] = useState<waypointDataType[]>(clone(props.missionWaypoints));
    const [editingIndex, setEditingIndex] = useState<number>(props.editIndex);

    return (
        <Modal
            show={props.show}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Waypoint Editor
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col lg={8}>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Command</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>MSL</th>
                                <th>AGL</th>
                                <th>Parameter</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {waypointsData &&
                            // @ts-ignore
                            waypointsData.map((data, indexs) => {
                                return (
                                    <tr key={indexs}
                                        className={(indexs === editingIndex ? 'select-red' : '' ? 'select-red' : '')}>
                                        <td>{(indexs + 1)}</td>
                                        <td>{data.command}</td>
                                        <td>{data.latitude?.toFixed(7)}</td>
                                        <td>{data.longitude?.toFixed(7)}</td>
                                        <td style={{width: "100px"}}>{data.altitude?.toFixed(0)} m</td>
                                        <td>{data.agl} m</td>
                                        <td>{data.parameter?.toString()}</td>
                                        <td>
                                            <ButtonGroup aria-label="Basic example" size="sm">
                                                <Button style={{fontSize: "10px"}} variant="dark" onClick={() => {
                                                    setEditingIndex(indexs);
                                                }}>
                                                    <i className="fa fa-pencil-alt"></i>
                                                </Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                );
                            })
                            }
                            </tbody>
                        </Table>
                    </Col>
                    <Col>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2"> Index </Form.Label>
                            <Col sm="10">
                                <Form.Control size="sm" type="number" disabled placeholder="Index"
                                              value={waypointsData[editingIndex].index + 1}/>
                            </Col>

                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2"> Latitude </Form.Label>
                            <Col sm="10">
                                <Form.Control size="sm" type="number" placeholder="Latitude"
                                              onChange={(e) => {
                                                  waypointsData[editingIndex].latitude = parseFloat(e.target.value);
                                                  setWaypointsData(waypointsData);
                                              }}
                                              value={waypointsData[editingIndex].latitude}/>
                            </Col>

                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2"> Longitude </Form.Label>
                            <Col sm="10">
                                <Form.Control size="sm" type="number" placeholder="Longitude"
                                              onChange={(e) => {
                                                  waypointsData[editingIndex].longitude = parseFloat(e.target.value);
                                                  setWaypointsData(waypointsData);
                                              }}
                                              value={waypointsData[editingIndex].longitude}/>
                            </Col>

                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2"> Altitude </Form.Label>
                            <Col sm="10">
                                <Form.Control size="sm" type="number" placeholder="Index"
                                              value={waypointsData[editingIndex].altitude}
                                              onChange={(e) => {
                                                  waypointsData[editingIndex].altitude = parseFloat(e.target.value);
                                                  setWaypointsData(waypointsData);
                                              }}/>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2"> Agl </Form.Label>
                            <Col sm="10">
                                <Form.Control size="sm" type="number" placeholder="Index"
                                              value={waypointsData[editingIndex].agl}
                                              onChange={(e) => {
                                                  waypointsData[editingIndex].agl = parseFloat(e.target.value);
                                                  setWaypointsData(waypointsData);
                                              }}/>
                            </Col>
                        </Form.Group>

                        <hr/>
                        <div className={"border p-3"}>
                            <legend
                                style={{
                                    position: "relative",
                                    fontSize: "18px",
                                    marginLeft: "1em"
                                }}>Waypoint
                            </legend>

                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="2"> Speed </Form.Label>
                                <Col sm="10">
                                    <Form.Select aria-label="Default select example"
                                                 value={waypointsData[editingIndex].parameter.airspeedSetPoint}
                                                 onChange={(e: any) => {
                                                     waypointsData[editingIndex].parameter.airspeedSetPoint = (parseInt(e.target.value));
                                                     setWaypointsData(waypointsData);
                                                 }}>
                                        <option value="0">Default</option>
                                        <option value="1">Low</option>
                                        <option value="2">High</option>
                                        <option value="3">Rush</option>
                                    </Form.Select>
                                </Col>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id={"default-1"}
                                    checked={(waypointsData[editingIndex].parameter?.followTrack)}
                                    label={"Follow Track"}
                                    onChange={(e: any) => {
                                        waypointsData[editingIndex].parameter.followTrack = e.target.checked;
                                        setWaypointsData(waypointsData);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    label="Visit Only"
                                    name="command"
                                    type="radio"
                                    id={"inline1"}
                                    checked={(waypointsData[editingIndex].command === 'WayPoint' ? true : false)}
                                    onChange={() => {
                                        waypointsData[editingIndex].command = 'WayPoint';
                                        setWaypointsData(waypointsData);
                                    }}
                                />
                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={4}>
                                        <Form.Check
                                            label="For Turns"
                                            name="command"
                                            type="radio"
                                            id={"inline2"}
                                            style={{width: "100%", float: "left"}}
                                            checked={(waypointsData[editingIndex].command === 'LoiterTurns' ? true : false)}
                                            onChange={() => {
                                                waypointsData[editingIndex].command = 'LoiterTurns'
                                                setWaypointsData(waypointsData);
                                            }}
                                        />
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Control size="sm" type="number" placeholder="Index"
                                                      disabled={(waypointsData[editingIndex].command === 'LoiterTurns' ? false : true)}
                                                      value={waypointsData[editingIndex].parameter.loiterTurns}
                                                      onChange={(e) => {
                                                          waypointsData[editingIndex].parameter.loiterTurns = (parseFloat(e.target.value));
                                                          setWaypointsData(waypointsData);
                                                      }}/>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={4}>
                                        <Form.Check
                                            style={{width: "100%", float: "left"}}
                                            label="For Minutes"
                                            name="command"
                                            type="radio"
                                            id={"inline2"}
                                            checked={(waypointsData[editingIndex].command === 'LoiterTime' ? true : false)}
                                            onChange={() => {
                                                waypointsData[editingIndex].command = 'LoiterTime'
                                                setWaypointsData(waypointsData);
                                            }}
                                        />
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Control size="sm" type="number" placeholder="Index"
                                                      disabled={(waypointsData[editingIndex].command === 'LoiterTime' ? false : true)}
                                                      value={waypointsData[editingIndex].parameter.loiterMinutes}
                                                      onChange={(e) => {
                                                          waypointsData[editingIndex].parameter.loiterMinutes = (parseFloat(e.target.value));
                                                          setWaypointsData(waypointsData);
                                                      }}/>
                                    </Col>
                                </Form.Group>

                                <Form.Check
                                    label="Until Altitude"
                                    name="command"
                                    type="radio"
                                    id={"inline2"}
                                    checked={(waypointsData[editingIndex].command === 'LoiterAltitude' ? true : false)}
                                    onChange={() => {
                                        waypointsData[editingIndex].command = 'LoiterAltitude'
                                        setWaypointsData(waypointsData);
                                    }}
                                />
                                <Form.Check
                                    label="Unlimited"
                                    name="command"
                                    type="radio"
                                    id={"inline2"}
                                    checked={(waypointsData[editingIndex].command === 'LoiterUnlimited' ? true : false)}
                                    onChange={() => {
                                        waypointsData[editingIndex].command = 'LoiterUnlimited';
                                        setWaypointsData(waypointsData);
                                    }}
                                />
                                <Form.Check
                                    label="Return to Launch"
                                    name="command"
                                    type="radio"
                                    id={"inline2"}
                                    checked={(waypointsData[editingIndex].command === 'ReturnToLaunch' ? true : false)}
                                    onChange={() => {
                                        waypointsData[editingIndex].command = 'ReturnToLaunch';
                                        setWaypointsData(waypointsData);
                                    }}
                                />
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="4"> Radius (in m.) </Form.Label>
                                    <Col sm={8}>
                                        <Form.Select aria-label="Jump"
                                                     disabled={(waypointsData[editingIndex].command !== 'WayPoint'
                                                     && waypointsData[editingIndex].command !== 'ReturnToLaunch'
                                                     && waypointsData[editingIndex].command !== 'Jump' ? false : true)}
                                                     value={waypointsData[editingIndex].parameter.jumpWaypointIndex}
                                                     onChange={(e: any) => {
                                                         waypointsData[editingIndex].parameter.jumpWaypointIndex = (parseInt(e.target.value));
                                                         setWaypointsData(waypointsData);
                                                     }}>
                                            <option value={0}>Default</option>
                                        </Form.Select>
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Check
                                        type="checkbox"
                                        id={"default-1"}
                                        checked={(waypointsData[editingIndex].parameter?.isLoiterClockwise)}
                                        label={"Clockwise"}
                                        disabled={(waypointsData[editingIndex].command !== 'Jump' && waypointsData[editingIndex].command !== 'WayPoint' ? false : true)}
                                        onChange={(e: any) => {
                                            waypointsData[editingIndex].parameter.isLoiterClockwise = e.target.checked;
                                            setWaypointsData(waypointsData);
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={5}>
                                        <Form.Check
                                            style={{width: "100%", float: "left"}}
                                            label="Hover for second"
                                            name="command"
                                            type="radio"
                                            id={"inline2"}
                                            disabled
                                            checked={(waypointsData[editingIndex].command === 'VtolHoverTime' ? true : false)}
                                            onChange={() => {
                                                waypointsData[editingIndex].command = 'VtolHoverTime'
                                                setWaypointsData(waypointsData);
                                            }}
                                        />
                                    </Col>
                                    <Col sm={7}>
                                        <Form.Control size="sm" type="number" placeholder="Index"
                                                      disabled={(waypointsData[editingIndex].command === 'VtolHoverTime' ? false : true)}
                                                      value={waypointsData[editingIndex].parameter.vtolHoverTime}
                                                      onChange={(e) => {
                                                          waypointsData[editingIndex].parameter.vtolHoverTime = (parseInt(e.target.value));
                                                          setWaypointsData(waypointsData);
                                                      }}/>
                                    </Col>
                                </Form.Group>


                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={3}>
                                        <Form.Check
                                            style={{width: "100%", float: "left"}}
                                            label="Jump"
                                            name="command"
                                            type="radio"
                                            id={"inline2"}
                                            checked={(waypointsData[editingIndex].command === 'Jump' ? true : false)}
                                            onChange={() => {
                                                waypointsData[editingIndex].command = 'Jump'
                                                setWaypointsData(waypointsData);
                                            }}
                                        />
                                    </Col>
                                    <Col sm={9}>
                                        <Form.Select aria-label="Jump"
                                                     disabled={(waypointsData[editingIndex].command === 'Jump' ? false : true)}
                                                     value={waypointsData[editingIndex].parameter?.jumpWaypointIndex}
                                                     onChange={(e: any) => {
                                                         console.log(e)
                                                         waypointsData[editingIndex].parameter.jumpWaypointIndex = (parseInt(e.target.value));
                                                         setWaypointsData(waypointsData);
                                                     }}>
                                            {
                                                waypointsData.map((option: any, index: number) => {
                                                    return (<option key={index}
                                                                    value={option.index}>{(index + 1) + "-" + option.command}</option>)
                                                })
                                            }
                                        </Form.Select>
                                    </Col>
                                </Form.Group>
                            </Form.Group>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>

                <Button variant={"success"} onClick={() => {
                    props.onCloseModal(true, waypointsData);
                }}>Ok</Button>
                <Button onClick={() => {
                    props.onCloseModal(false, null);
                }}>Cancel</Button>
            </Modal.Footer>
        </Modal>);
}

export default ModalsWaypoint;
