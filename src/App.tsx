import React from 'react';
import logo from './logo.svg';
import './App.css';
import Sidebar from './Module/Sidebar'

import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container,
    Row,
    Col,
} from 'react-bootstrap'


function App() {
    return (
        <Container fluid style={{paddingLeft: '0'}}>
            <Row>
                <Col>
                    <iframe id="gcsMap" src="GCSMap/GCSMap.html" style={{width: '100%',height: '99.80vh',border: '0px',padding: '0px',margin: '0px'}}></iframe>
                </Col>
                <Col lg="4">
                    <Sidebar></Sidebar>
                </Col>
            </Row>
        </Container>
    );
}

export default App;
