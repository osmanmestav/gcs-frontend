import React, {useEffect, useState} from 'react';
import "./login";
import './App.css';
// @ts-ignore
import Sidebar from './views/Sidebar.tsx'

import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col, Button} from 'react-bootstrap'
import {Auth} from 'aws-amplify';
import MQTTManager from './managers/mqttManager';
import simulateTelemetry from './managers/simulateTelemetry';
import {MessageBoxProvider} from './hooks/messageBox';

const loginURL = "/login/signin.html";

function App() {
    const [mapsWindow, setMapsWindow] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mqttManager, setMQTTManager] = useState<MQTTManager | null>(null);
    const [simulationStarted, setSimulationStarted] = useState(false);
    const [sidebarStatus, setSidebarStatus] = useState<boolean>(false);

    useEffect(() => {
        Auth.currentAuthenticatedUser().then(u => {
            const user = u;
            console.log("Logged in.");
            console.log(user);
            setIsLoggedIn(true);
        }).catch(err => {
            console.log(err);
            // eslint-disable-next-line no-restricted-globals
            location.href = loginURL;
        });
    }, []);


    const onIFrameLoad = () => {

        var gcsMap = document.getElementById('gcsMap') as any;
        setMapsWindow(gcsMap?.contentWindow);

        if (isLoggedIn && gcsMap != null && gcsMap.contentWindow != null) {
            if (mqttManager != null) {
                mqttManager.finalizeMQTT();
            }
            const mqtt = new MQTTManager(gcsMap?.contentWindow);
            mqtt.initializeMQTT();
            setMQTTManager({...mqtt});
        } else {
            if (mqttManager != null) {
                mqttManager.finalizeMQTT();
            }
            setMQTTManager(null);
        }
        setSidebarStatus(true);
    };

    const openGauges = () => {
        let newWindow: any = null;
        (window as any).gaugesWindow = newWindow = window.open("Gauges/Gauges.html", "GaugesWindow") as any;
        newWindow.csharp = mapsWindow!.csharp;
        mqttManager?.setGaugesWindow(newWindow);
    }
    const certificateNameForTelemetrySimulation = "Test";
    const startSimulation = () => {
        const message = simulateTelemetry(mapsWindow.unitsHelper, mapsWindow.UnitType);
        mqttManager?.simulateTelemetryPublish(certificateNameForTelemetrySimulation, message);
    }

    const startTelemetrySimulation = () => {
        setSimulationStarted(true);
    }

    useEffect(() => {
        if (mqttManager != null && simulationStarted) {
            mqttManager?.registerAircraft(certificateNameForTelemetrySimulation, false);
            setInterval(startSimulation, 100);
        }
    }, [simulationStarted]);

    return (
        <MessageBoxProvider>
            <Container fluid style={{paddingLeft: '0'}}>
                {isLoggedIn &&
                <Row>
                    <Col lg="12" className="mr-0 p-0">
                        <iframe id="gcsMap" src="GCSMap/GCSMap.html" title="Map"
                                style={{
                                    width: '100%',
                                    height: '99.80vh',
                                    border: '0px',
                                    padding: '0px',
                                    margin: '0px'
                                }}
                                onLoad={() => onIFrameLoad()}
                        />
                    </Col>
                    <Button size="sm" variant="dark" className="openButton"
                            onClick={() => setSidebarStatus(!sidebarStatus)}>
                        <i className="fas fa-align-justify"/>
                    </Button>
                    {mapsWindow && mapsWindow.csharp && mqttManager ?
                        <Col lg="4" className={"sidebar " + (sidebarStatus ? "open" : "close")}>
                            <Sidebar mapsWindow={mapsWindow} openGauges={openGauges}
                                     flightData={mqttManager.flightData}
                                     subscribeToAircraftStatuses={mqttManager.subscribeToAircraftStatuses}
                                     subscribeToUserStatuses={mqttManager.subscribeToControlStationStatuses}
                                     startTelemetrySimulation={startTelemetrySimulation}/>
                        </Col>
                        : null
                    }
                </Row>
                }
            </Container>
        </MessageBoxProvider>

    );
}

export default App;
