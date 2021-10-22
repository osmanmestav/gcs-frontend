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

const loginURL = "/login/signin.html";
function App() {
    const [mapWindow, setMapWindow] = useState<any>(null);
    const [gaugesWindow, setGaugesWindow] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        var a = document.getElementById('gcsMap') as any;
        setMapWindow(a?.contentWindow);
    }, [isLoggedIn]);

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
        const newWindow = window.open("Gauges/Gauges.html", "GaugesWindow") as any;
        newWindow.csharp = mapWindow!.csharp;
        setGaugesWindow(newWindow);
    }

    return (
        
        <Container fluid style={{paddingLeft: '0'}}>
            {isLoggedIn &&
            <Row>
                <Col>
                    <iframe id="gcsMap" src="GCSMap/GCSMap.html" style={{width: '100%',height: '99.80vh',border: '0px',padding: '0px',margin: '0px'}}></iframe>
                </Col>
                <Col lg="4">
                    { mapWindow && 
                        <Sidebar mapWindow={mapWindow} openGauges={openGauges}/>}
                </Col>
            </Row>
        }
        </Container>
    );
}

export default App;
