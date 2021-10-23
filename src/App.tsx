import React, { useEffect, useState } from 'react';
import "./login";
import logo from './logo.svg';
import './App.css';
import Sidebar from './Module/Sidebar'

import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container,
    Row,
    Col,
} from 'react-bootstrap'
import { Auth } from 'aws-amplify';
import MQTTManager from './managers/mqttManager';
import simulateTelemetry from './managers/simulateTelemetry';

const loginURL = "/login/signin.html";
function App() {
    const [mapsWindow, setMapsWindow] = useState<any>(null);
    const [gaugesWindow, setGaugesWindow] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mqttManager, setMQTTManager] = useState<MQTTManager | null>(null);
    const [simulationStarted, setSimulationStarted] = useState(false);

    useEffect(() => {
        var a = document.getElementById('gcsMap') as any;
        setMapsWindow(a?.contentWindow);

        if(isLoggedIn && a != null && a.contentWindow != null){
            const mqtt = new MQTTManager(a?.contentWindow);
            setMQTTManager(mqtt);
        }
        else {
            setMQTTManager(null);
        }

    }, [isLoggedIn]);

    useEffect(() => {
        mqttManager?.initializeMQTT();
    }, [mqttManager]);

    useEffect(() => {
        Auth.currentAuthenticatedUser().then(u => {
            const user = u;
            console.log("Logged in.");
            console.log(user);
            setIsLoggedIn(true);
            //initializeMQTT();
        }).catch(err => {
            console.log(err);
            // eslint-disable-next-line no-restricted-globals
            location.href = loginURL;
        });
    }, [])

    const openGauges = () => {
        let newWindow : any = null;
        (window as any).gaugesWindow = newWindow = window.open("Gauges/Gauges.html", "GaugesWindow") as any;
        newWindow.csharp = mapsWindow!.csharp;
        mqttManager?.setGaugesWindow(newWindow);
        setGaugesWindow(newWindow.contentWindow);
    }

    const startSimulation = () => {
        const message = simulateTelemetry(mapsWindow.unitsHelper, mapsWindow.UnitType);
        mqttManager?.publishTelemetry(message);
        mapsWindow.window.dispatchEvent(new CustomEvent("planeChanged", {"detail": message}));
    }

    const startTelemetrySimulation = () => {
        setSimulationStarted(true);
    }

    useEffect(()=> {
        if(simulationStarted)
            setInterval(startSimulation, 100);
    }, [simulationStarted]);

    return (
        
        <Container fluid style={{paddingLeft: '0'}}>
            {isLoggedIn &&
            <Row>
                <Col>
                    <iframe id="gcsMap" src="GCSMap/GCSMap.html" style={{width: '100%',height: '99.80vh',border: '0px',padding: '0px',margin: '0px'}}></iframe>
                </Col>
                <Col lg="4">
                    { mapsWindow && 
                        <Sidebar mapWindow={mapsWindow} openGauges={openGauges} startTelemetrySimulation={startTelemetrySimulation}/>}
                </Col>
            </Row>
        }
        </Container>
    );
}

export default App;
