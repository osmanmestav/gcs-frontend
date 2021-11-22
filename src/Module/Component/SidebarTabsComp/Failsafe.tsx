import React from 'react';
import {Row, Col, Form} from 'react-bootstrap'

type WaypointsTabProps = {
    jumpToWaypoint: (index: number) => void;
    defaultAgl: number;
    setDefaultAgl: (val: number) => void;
    CommandList: any[];
    currentMissionIndex: number;
    selectedWaypointIndices: number[];
    WaypointEditAction: any;
    onWaypointClick: (index: number) => void;
    clearWaypoints: any;
}

function WaypointsTab(props: WaypointsTabProps) {
    // @ts-ignore
    return (
        <div>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Lost RC Action</Form.Label>
                        <Form.Select size="sm" aria-label="Default select example"
                                     onChange={(e: any) => {
                                     }}>
                            <option value="0">None</option>
                            <option value="1">Short</option>
                            <option value="2">Shot&Long</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Lost GCS Action</Form.Label>
                        <Form.Select size="sm" aria-label="Default select example"
                                     onChange={(e: any) => {
                                     }}>
                            <option value="0">None</option>
                            <option value="1">Short</option>
                            <option value="2">Shot&Long</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Long Action</Form.Label>
                        <Form.Select size="sm" aria-label="Default select example"
                                     onChange={(e: any) => {
                                     }}>
                            <option value="0">ReturnToLaunch</option>
                            <option value="1">Short</option>
                            <option value="2">Shot&Long</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row style={{marginTop: "15px"}}>
                <Col>
                    <Form.Check
                        label="Rescue on loss of manuel control"
                        inline
                        name="command"
                        type="checkbox"
                        id={"inline2"}
                        onChange={(e) => {

                        }}

                    />
                </Col>
            </Row>

            <Row style={{marginTop: "15px"}}>
                <Col>
                    <Form.Check
                        label="Block RC command switch"
                        inline
                        name="command"
                        type="checkbox"
                        id={"inline2"}
                        onChange={(e) => {
                        }}
                    />
                </Col>
            </Row>


            <Row style={{marginTop: "15px"}}>
                <Col><Form.Label>Climbrate tolerance for rescue (m/s)</Form.Label></Col>
                <Col sm={3}>
                    <Form.Group>

                        <Form.Control size="sm" type="number" placeholder="Index"
                                      value={10}
                                      onChange={(e) => {
                                          console.log(e.target.value)
                                      }}/>
                    </Form.Group>
                </Col>
            </Row>


            <Row style={{marginTop: "15px"}}>
                <Col>
                    <Form.Label>Seconds to start short action for RC</Form.Label>
                </Col>
                <Col sm={3}>
                    <Form.Group>

                        <Form.Control size="sm" type="number" placeholder="Index"
                                      value={1}
                                      onChange={(e) => {
                                          console.log(e.target.value)
                                      }}/>
                    </Form.Group>
                </Col>
            </Row>


            <Row style={{marginTop: "15px"}}>
                <Col>
                    <Form.Label>Seconds to start short action for GPS</Form.Label>
                </Col>
                <Col sm={3}>
                    <Form.Group>

                        <Form.Control size="sm" type="number" placeholder="Index"
                                      value={2}
                                      onChange={(e) => {
                                          console.log(e.target.value)
                                      }}/>
                    </Form.Group>
                </Col>
            </Row>

            <Row style={{marginTop: "15px"}}>
                <Col>
                    <Form.Label>Seconds to start short action for Ground Control</Form.Label>
                </Col>
                <Col sm={3}>
                    <Form.Group>

                        <Form.Control size="sm" type="number" placeholder="Index"
                                      value={10}
                                      onChange={(e) => {
                                          console.log(e.target.value)
                                      }}/>
                    </Form.Group>
                </Col>
            </Row>

            <Row style={{marginTop: "15px"}}>
                <Col>
                    <Form.Label>Seconds to start long action</Form.Label>
                </Col>
                <Col sm={3}>
                    <Form.Group>

                        <Form.Control size="sm" type="number" placeholder="Index"
                                      value={300}
                                      onChange={(e) => {
                                          console.log(e.target.value)
                                      }}/>
                    </Form.Group>
                </Col>
            </Row>


            <br/>
            <br/>
        </div>
    );
}

export default WaypointsTab;
