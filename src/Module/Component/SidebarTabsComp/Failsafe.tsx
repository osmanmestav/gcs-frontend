import React, {useState, useEffect} from 'react';
import {Row, Col, Form} from 'react-bootstrap'


type failSafeType = {
    blockRCCommandSwitch: boolean
    climbRateToleranceForRescue: number
    longAction: { type: number, wayPointIndex: number }
    lossOfGCSActionChoice: number
    lossOfRCACtionChoice: number
    rescueOnLossOfControl: boolean
    timeLongAction: number
    timeShortActionGCS: number
    timeShortActionGPS: number
    timeShortActionRC: number
    csharp: any
}

function failSafeTab(props: any) {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [failSafe, setfailSafe] = useState<any>({});

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        setfailSafe(props.csharp?.getFailsafe());
    });

    // @ts-ignore
    const setFailSafe = (data) => {
        setfailSafe({
            rescueOnLossOfControl: data.rescueOnLossOfControl,
            blockRCCommandSwitch: data.blockRCCommandSwitch,
            lossOfRCACtionChoice: data.lossOfRCACtionChoice, // 2 Enable long action, 1 Enable short action, 0 Disable
            lossOfGCSActionChoice: data.lossOfGCSActionChoice, // // 2 Enable long action, 1 Enable short action, 0 Disable
            climbRateToleranceForRescue: data.climbRateToleranceForRescue,
            longAction: data.longAction, // 0 Return To Launch, 1 short, 2 short&long
            timeShortActionRC: data.timeShortActionRC, //Seconds
            timeShortActionGPS: data.timeShortActionGPS, //Seconds
            timeShortActionGCS: data.timeShortActionGCS, //Seconds
            timeLongAction: data.timeLongAction, //Seconds
        });
    };

    // @ts-ignore
    return (
        <div>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Lost RC Action</Form.Label>
                        <Form.Select size="sm" aria-label="Default select example"
                                     value={failSafe?.lossOfRCACtionChoice}
                                     onChange={(e: any) => {
                                         var newfailSafe = failSafe;
                                         newfailSafe.lossOfRCACtionChoice = parseInt(e.target.value);
                                         setFailSafe(newfailSafe);
                                         props.csharp?.setFailsafe(newfailSafe)

                                     }}
                        >
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
                                     value={failSafe?.lossOfGCSActionChoice}
                                     onChange={(e: any) => {
                                         var newfailSafe = failSafe;
                                         newfailSafe.lossOfGCSActionChoice = parseInt(e.target.value);
                                         setFailSafe(newfailSafe);
                                         props.csharp?.setFailsafe(newfailSafe)
                                     }}
                        >
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
                                     value={failSafe?.longAction}
                                     onChange={(e: any) => {
                                         var newfailSafe = failSafe;
                                         newfailSafe.longAction = parseInt(e.target.value);
                                         setFailSafe(newfailSafe);
                                         props.csharp?.setFailsafe(newfailSafe)
                                     }}
                        >
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
                        value={failSafe?.rescueOnLossOfControl}
                        onChange={(e) => {
                            console.log(e)
                            var newfailSafe = failSafe;
                            newfailSafe.rescueOnLossOfControl = e.target.checked;
                            setFailSafe(newfailSafe);
                            props.csharp?.setFailsafe(newfailSafe)
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
                        value={failSafe?.blockRCCommandSwitch}
                        onChange={(e) => {
                            console.log(e)
                            var newfailSafe = failSafe;
                            newfailSafe.blockRCCommandSwitch = e.target.checked;
                            setFailSafe(newfailSafe);
                            props.csharp?.setFailsafe(newfailSafe)
                        }}
                    />
                </Col>
            </Row>


            <Row style={{marginTop: "15px"}}>
                <Col><Form.Label>Climbrate tolerance for rescue (m/s)</Form.Label></Col>
                <Col sm={3}>
                    <Form.Group>

                        <Form.Control size="sm" type="number" placeholder="Index"
                                      value={failSafe?.climbRateToleranceForRescue}
                                      onChange={(e) => {
                                          var newfailSafe = failSafe;
                                          newfailSafe.climbRateToleranceForRescue = e.target.value;
                                          setFailSafe(newfailSafe);
                                          props.csharp?.setFailsafe(newfailSafe)
                                      }}

                        />
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
                                      value={failSafe?.timeShortActionRC}
                                      onChange={(e) => {
                                          var newfailSafe = failSafe;
                                          newfailSafe.timeShortActionRC = e.target.value;
                                          setFailSafe(newfailSafe);
                                          props.csharp?.setFailsafe(newfailSafe)
                                      }}
                        />
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
                                      value={failSafe?.timeShortActionGPS}
                                      onChange={(e) => {
                                          var newfailSafe = failSafe;
                                          newfailSafe.timeShortActionGPS = e.target.value;
                                          setFailSafe(newfailSafe);
                                          props.csharp?.setFailsafe(newfailSafe)
                                      }}
                        />
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
                                      value={failSafe?.timeShortActionGCS}
                                      onChange={(e) => {
                                          var newfailSafe = failSafe;
                                          newfailSafe.timeShortActionGCS = e.target.value;
                                          setFailSafe(newfailSafe);
                                          props.csharp?.setFailsafe(newfailSafe)
                                      }}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row style={{marginTop: "15px"}}>
                <Col>
                    <Form.Label>Seconds to start long action</Form.Label>
                </Col>
                <Col sm={3}>
                    <Form.Group>
                        <Form.Control size="sm" type="number" placeholder="Index" value={failSafe?.timeLongAction}
                                      onChange={(e) => {
                                          var newfailSafe = failSafe;
                                          newfailSafe.timeLongAction = e.target.value;
                                          setFailSafe(newfailSafe);
                                          props.csharp?.setFailsafe(newfailSafe)
                                      }}
                        />
                    </Form.Group>
                </Col>
            </Row>


            <br/>
            <br/>
        </div>
    );
}

export default failSafeTab;
