import React, {useRef, useState, useEffect} from 'react';
import {
    Row,
    Col,
    Button,
    Form,
} from 'react-bootstrap'
import { useMessageBox } from '../../hooks/messageBox';
import MissionManager from '../../managers/missionManager';

function SidebarControlButtons(props: any) {
    const { askConfirmation } = useMessageBox();
    const Download = () => {
        props.mapWindow.csharp.downloadMission();
    }
    const Upload = async () => {
        const missionManager = new MissionManager(props.mapWindow.csharp.getMission(), props.mapWindow.csharp.getCurrentTelemetrySummary()); 
        let sanityCheckResults = missionManager.check();
        let uploadPossible = sanityCheckResults === "";
        if(!uploadPossible){
            const confirmed = await askConfirmation({
                title: "Warning!",
                message: "We found the following issues in your mission:\n" + sanityCheckResults + "\r\n\r\nDo you want to upload anyway?",
            });
            uploadPossible = confirmed;
        }
        if(uploadPossible === true){
            if (sanityCheckResults === "") sanityCheckResults = "No problems were found.";
            props.mapWindow.FlightSummary.addToSummary("Message", "Sanity check results: \r\n" + sanityCheckResults);
            props.mapWindow.csharp.uploadMission();
        }
    }
    const startMission = () => {
        const telemetrySummary = props.mapWindow.csharp.getCurrentTelemetrySummary();

        if(telemetrySummary.isSittingOnGround){
            props.mapWindow.csharp.startMission();
        }
        else {
            props.mapWindow.FlightSummary.addToSummary("Warning", "Aircraft is already flying! \r\n");
        }
    }
    const stopAllMissions = () => {
        props.mapWindow.csharp.stopAllMissions();
    }
    const setTakeoff = () => {
        props.mapWindow.setTakeoff();
    }
    const setLaunch = () => {
        props.mapWindow.setLaunch();
    }
    const saveMission = () => {
        const blob = new Blob([props.mapWindow.csharp.mission], {type: 'text/json'})
        const a = document.createElement('a')
        a.download = 'users.json'
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
    }

    let loadMissionFile = useRef() as any;
    const loadMission = () => {
        console.log(props.mapWindow.csharp.mission)
        // @ts-ignore
        loadMissionFile.current.click();
    }
    const handleFileUpload = (e: any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = event => {
            props.mapWindow.csharp.setMission(event.target?.result)
            console.log("Load Data", event.target?.result);
        };
    };

    // @ts-ignore
    return (
        <div style={{height: '100%', minHeight: '40px', marginTop: '20px'}}>
            <Row>
                <Col>
                    <Button style={{marginRight: '5px'}} variant="dark" size="sm" id="gaugesButton"
                            onClick={props.openGauges}>Open Gauges</Button>
                </Col>
                <Col>
                    <Button style={{marginRight: '5px', display: "none"}} variant="dark" size="sm" id="simulateTelemetry"
                            disabled={false} 
                            onClick={props.startTelemetrySimulation}>Simulate Telemetry</Button>
                </Col>
                <Button className="mb-2" style={{width: '100%', height: '28%', marginTop: '10px'}} variant="dark" size="sm"
                            onClick={() => startMission()}><i className="fas fa-play"></i> Start Mission</Button>
            </Row>
            <Row style={{marginTop: '20px'}}>
                <Col lg="2" className="p-1" style={{display: "none"}}>
                    <Button style={{width: '100%', height: '100%'}} variant="dark" size="sm"
                            onClick={() => setLaunch()}>Return To Launch</Button>
                </Col>
                <Col lg="2" className="p-1" style={{display: "none"}}>
                    <Button style={{width: '100%', height: '100%'}} variant="dark" size="sm"
                            onClick={() => setTakeoff()}>Take Off</Button>
                </Col>
                <Col lg="2" className="p-1" style={{display: "none"}}>
                    <Button disabled className="mb-2" style={{width: '100%', height: '47%'}} variant="dark" size="sm">Vtol
                        Speed Hold</Button>
                    <Button disabled variant="dark" style={{width: '100%', height: '47%'}} size="sm">Deploy
                        Parachute</Button>
                </Col>
                <Col lg="2" className="p-1" style={{display: "none"}}>
                    <Button disabled className="mb-2" style={{width: '100%'}} variant="dark" size="sm">Fly by Wire
                        A</Button>
                    <Button disabled className="mb-2" style={{width: '100%'}} variant="dark" size="sm">Fly by Wire
                        B</Button>
                    <Button disabled className="mb-2" style={{width: '100%', height: '23%'}} variant="dark"
                            size="sm">Sit</Button>
                </Col>
                <Col lg="2" style={{display: "none"}}>
                    <Button disabled className="mb-2" style={{width: '100%', height: '45px'}} variant="dark"
                            size="sm">Manuel</Button>
                    <Button disabled className="mb-2" style={{width: '100%', height: '45px'}} variant="dark"
                            size="sm">Land</Button>
                    <Button disabled className="mb-2" style={{width: '100%', height: '45px'}} variant="dark"
                            size="sm">Loiter</Button>
                </Col>
                <Col lg="2" style={{display: "none"}}>
                    <Button className="mb-2" style={{width: '100%', height: '28%'}} variant="dark" size="sm"
                            onClick={() => startMission()}><i className="fas fa-play"></i> Start Mission</Button>
                    <Button className="mb-2" style={{width: '100%', height: '28%'}} variant="dark" size="sm"
                            onClick={() => stopAllMissions()}><i className="fas fa-stop"></i> Stop Mission</Button>
                    <Button disabled className="mb-2" style={{width: '100%', height: '28%'}} variant="dark" size="sm"><i
                        className="fas fa-box"></i> Continue</Button>
                </Col>

                <Col lg="12" className="mt-2 mb-2">
                    <Button style={{width: '24%', marginRight: '5px'}} variant="dark" size="sm"
                            onClick={() => Download()}><i className="fas fa-cloud-download-alt"></i> Download</Button>
                    <Button style={{width: '24%', marginRight: '5px'}} variant="dark" size="sm"
                            onClick={() => Upload()}><i className="fas fa-cloud-upload-alt"></i> Upload</Button>
                    <Button style={{width: '24%', marginRight: '5px'}} variant="dark" size="sm"
                            onClick={() => loadMission()}>
                        <i className="fas fa-spinner"></i> Load
                    </Button>
                    <input type="file" ref={loadMissionFile} className="form-control form-control-sm"
                           style={{display: "none"}} accept={".json"} onChange={handleFileUpload}/>
                    <Button style={{width: '25%'}} variant="dark" size="sm" onClick={() => saveMission()}>
                        <i className="fas fa-file-export"></i> Save</Button>

                </Col>
            </Row>
        </div>
    );
}


export default SidebarControlButtons;
