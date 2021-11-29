import React, {useEffect, useState} from 'react';
import "./login";
import './App.css';
// @ts-ignore
import Sidebar from './Module/Sidebar.tsx'

import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col, Button} from 'react-bootstrap'
import {Auth} from 'aws-amplify';
import MQTTManager from './managers/mqttManager';
import simulateTelemetry from './managers/simulateTelemetry';
import { MessageBoxProvider } from './hooks/messageBox';

const loginURL = "/login/signin.html";

function App() {
    const [mapsWindow, setMapsWindow] = useState<any>(null);
    const [gaugesWindow, setGaugesWindow] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mqttManager, setMQTTManager] = useState<MQTTManager | null>(null);
    const [simulationStarted, setSimulationStarted] = useState(false);
    const [sidebarStatus, setsidebarStatus] = useState("close");

    useEffect(() => {
        var gcsMap = document.getElementById('gcsMap') as any;
        setMapsWindow(gcsMap?.contentWindow);

        if (isLoggedIn && gcsMap != null && gcsMap.contentWindow != null) {
            if(mqttManager != null){
                mqttManager.finalizeMQTT();
            }
            const mqtt = new MQTTManager(gcsMap?.contentWindow);
            mqtt.initializeMQTT();
            setMQTTManager(mqtt);
        } else {
            if(mqttManager != null){
                mqttManager.finalizeMQTT();
            }
            setMQTTManager(null);
        }

    }, [isLoggedIn]);

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
    }, [])

    const openGauges = () => {
        let newWindow: any = null;
        (window as any).gaugesWindow = newWindow = window.open("Gauges/Gauges.html", "GaugesWindow") as any;
        newWindow.csharp = mapsWindow!.csharp;
        mqttManager?.setGaugesWindow(newWindow);
        setGaugesWindow(newWindow.contentWindow);
    }
    const certificateNameForTelemetrySimulation = "Test";
    const startSimulation = () => {
        const message = simulateTelemetry(mapsWindow.unitsHelper, mapsWindow.UnitType);
        mqttManager?.simulateTelemetryPublish(certificateNameForTelemetrySimulation, message);
        mapsWindow.window.dispatchEvent(new CustomEvent("planeChanged", {"detail": message}));
    }

    const startTelemetrySimulation = () => {
        setSimulationStarted(true);
    }

    useEffect(() => {
        
        if(mqttManager != null && simulationStarted){
            mqttManager?.AircraftSubscribe(certificateNameForTelemetrySimulation);
            setInterval(startSimulation, 100);
        }
    }, [simulationStarted]);


    const sidebarOpenClose = () => {
        if (sidebarStatus == "close") {
            setsidebarStatus("open");
        } else if (sidebarStatus == "open") {
            setsidebarStatus("close");
        }

    }

//console.log(mapsWindow?.csharp.getCommandExpandedAt(0));
    return (
        <MessageBoxProvider>
            <Container fluid style={{paddingLeft: '0'}}>
                {isLoggedIn &&
                <Row>
                    <Col lg="12" className="mr-0 p-0">
                        <iframe id="gcsMap" src="GCSMap/GCSMap.html" style={{
                            width: '100%',
                            height: '99.80vh',
                            border: '0px',
                            padding: '0px',
                            margin: '0px'
                        }}></iframe>
                    </Col>
                    <Button size="sm" variant="dark" className="openButton" onClick={sidebarOpenClose}><i className="fas fa-align-justify"></i></Button>
                    <Col lg="4" className={"sidebar " + sidebarStatus}>
                        {mapsWindow &&
                        <Sidebar mapWindow={mapsWindow} openGauges={openGauges}
                                startTelemetrySimulation={startTelemetrySimulation}/>}
                    </Col>
                </Row>
                }
            </Container>
        </MessageBoxProvider>
        
    );
}

export default App;
