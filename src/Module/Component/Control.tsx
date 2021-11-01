import React, {useState, useEffect} from 'react';
import {
    Row,
    Col,
    Button,
} from 'react-bootstrap'

function SidebarControlButtons(props:any) {
        const Download = () =>{
            props.mapWindow.csharp.clearWaypoints();
            props.mapWindow.csharp.clearWaypoints();
            props.mapWindow.csharp.clearWaypoints();
            props.mapWindow.csharp.downloadMission();
        }
        const Upload = () =>{
            props.mapWindow.csharp.uploadMission();
        }
        const startMission = () =>{
            props.mapWindow.csharp.startMission();
        }
        const stopAllMissions = () =>{
            props.mapWindow.csharp.stopAllMissions();
        }

    return (
        <div style={{height: '100%', minHeight: '200px', marginTop: '20px'}}>
            <Row>
                <Col>
                    <Button style={{marginRight: '5px'}} variant="primary" size="sm" id="gaugesButton" onClick={props.openGauges}>Open Gauges</Button>
                </Col>
                <Col>
                    <Button style={{marginRight: '5px'}} variant="primary" size="sm" id="simulateTelemetry" onClick={props.startTelemetrySimulation}>Simulate Telemetry</Button>
                </Col>
            </Row>
            <Row style={{marginTop: '20px'}}>
                <Col lg="2" className="p-1">
                    <Button disabled style={{width: '100%', height: '100%'}} variant="warning" size="sm">Return To Launch</Button>
                </Col>
                <Col lg="2" className="p-1">
                    <Button disabled style={{width: '100%', height: '100%'}} variant="primary" size="sm">Take Off</Button>
                </Col>
                <Col lg="2" className="p-1">
                    <Button disabled className="mb-2" style={{width: '100%', height: '47%'}} variant="primary" size="sm">Vtol Speed Hold</Button>
                    <Button disabled variant="primary" style={{width: '100%', height: '47%'}} size="sm">Deploy Parachute</Button>
                </Col>
                <Col lg="2" className="p-1">
                    <Button disabled className="mb-2" style={{width: '100%'}} variant="primary" size="sm">Fly by Wire A</Button>
                    <Button disabled className="mb-2" style={{width: '100%'}} variant="primary" size="sm">Fly by Wire B</Button>
                    <Button disabled className="mb-2" style={{width: '100%', height:'23%'}} variant="primary" size="sm">Sit</Button>
                </Col>
                <Col lg="2">
                    <Button disabled className="mb-2" style={{width: '100%', height:'45px'}} variant="primary" size="sm">Manuel</Button>
                    <Button disabled className="mb-2" style={{width: '100%', height:'45px'}} variant="primary" size="sm">Land</Button>
                    <Button disabled className="mb-2" style={{width: '100%', height:'45px'}} variant="primary" size="sm">Loiter</Button>
                </Col>
                <Col lg="2">
                    <Button className="mb-2" style={{width:'100%',height: '28%'}} variant="primary" size="sm" onClick={() => startMission()}><i className="fas fa-play"></i> Start Mission</Button>
                    <Button className="mb-2" style={{width:'100%',height: '28%'}} variant="primary" size="sm" onClick={() => stopAllMissions()}><i className="fas fa-stop"></i> Stop Mission</Button>
                    <Button disabled className="mb-2" style={{width:'100%',height: '28%'}} variant="primary" size="sm"><i className="fas fa-box"></i> Continue</Button>
                </Col>

                <Col lg="12" className="mt-2 mb-2">
                    <Button style={{width:'24%',marginRight: '5px'}} variant="primary" size="sm" onClick={() => Download()}><i className="fas fa-cloud-download-alt"></i> Download</Button>
                    <Button style={{width:'24%',marginRight: '5px'}} variant="primary" size="sm" onClick={() => Upload()}><i className="fas fa-cloud-upload-alt"></i> Upload</Button>
                    <Button disabled style={{width:'24%',marginRight: '5px'}} variant="primary" size="sm"><i className="fas fa-spinner"></i> Load</Button>
                    <Button disabled style={{width:'25%'}} variant="primary" size="sm"><i className="fas fa-file-export"></i> Save</Button>
                </Col>
            </Row>
        </div>
    );
}


export default SidebarControlButtons;
