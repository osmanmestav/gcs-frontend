import React, {useState, useEffect} from 'react';
import {Form, Table, Button, ButtonGroup, Tabs, Tab, Modal} from 'react-bootstrap'
import Switch from "react-switch";


import WaypointsTab from "./SidebarTabsComp/WaypointsTab";
import GeoFenceTab from "./SidebarTabsComp/GeoFenceTab";
import Failsafe from "./SidebarTabsComp/Failsafe";
import ModalsWaypoint from "./waypointModal";
import {geoFenceType, missionDataType} from "../models/missionTypes";
import {debug} from "webpack";

function SidebarTabs(props: any) {

    let waypointsListArray: any[];

    const [defaultAgl, setDefaultAgl] = useState<number>(400);
    const [isDraft, setIsDraft] = useState<boolean>(false);
    const [missionData, setMission] = useState<missionDataType>(); //Mission
    const [missionDraft, setMissionDraft] = useState<missionDataType>(); //MissionDraft


    const [waypointsList, setwaypointsList] = useState<any>([]); //CommandList
    const [Draft, setDraft] = useState<any>([]); //CommandList
    const [wayPointCurrent, setwayPointCurrent] = useState<any>(null);
    const [selectedWaypointIndices, setSelectedWaypointIndices] = useState<number[]>([]);
    const [HomeLocation, setHomeLocation] = useState<any>({
        latitude: 0,
        longitude: 0,
        altitude: 0,
    });
    const [waypointModalStatus, setwaypointModalStatus] = useState<boolean>(false);
    const [waypointModalData, setwaypointModalData] = useState<any>();

    const [GeoFenceData, setGeoFenceData] = useState<any>([]);


    /*
     * Waypoint Operation Start
     */

    // @ts-ignore
    const addWaypoint = ({detail}) => {
        if (detail.isFromDownload == undefined) {
            try {
                var a = (missionDraft as any);
                a.waypoints.push({...detail, agl: defaultAgl})
                setMissionDraft(a);
            } catch (e) {
                console.log(e)
            }
            //setIsDraft(true);
        }
        //console.log(isDraft)
    };

    const changedWaypoint = (e: { detail: any; }) => {
        try {
            const draftMissionChangedData = missionDraft;
            draftMissionChangedData!.waypoints[e.detail.index] = {...e.detail, agl: defaultAgl};
            setMissionDraft(draftMissionChangedData)
        } catch (e) {
            console.log(e)
        }
        //setIsDraft(true);
        console.log(isDraft)
    }


    const removeWaypoint = (e: { detail: any; }) => {
        try {// @ts-ignore
            const filteredDrafDataMission = missionDraft!.waypoints.filter(({index: index}) => index !== e.detail);
            for (let i = 0; i < filteredDrafDataMission.length; i++) {
                // @ts-ignore
                filteredDrafDataMission[i].index = i;
            }
            var newMissionDraft = missionDraft;
            newMissionDraft!.waypoints = filteredDrafDataMission;
            setMissionDraft(newMissionDraft);
            //setIsDraft(true);
        } catch (e) {
            console.log(e)
        }
        console.log(isDraft)
    }


    const clearWaypoints = () => {
        try {
            if (missionDraft) {
                const draftMissionClearData = missionDraft;
                draftMissionClearData!.waypoints = [];
                setMissionDraft(draftMissionClearData);
            }
            //setIsDraft(true);
        } catch (e) {
            console.log(e)
        }
        console.log(isDraft)
    }
    /*
    * Waypoint Operation End
    */


    // @ts-ignore
    const setwayPoint = (e) => {
        //debugger
        if (e.detail.waypoint) {
            setwayPointCurrent({
                ...e.detail.waypoint,
                commandSource: e.detail.waypoint.index,
            })
        }
    };

    // @ts-ignore
    const WaypointSelectionChanged = (e) => {
        // console.log("WaypointSelectionChanged: ", e.detail);
        setSelectedWaypointIndices(e.detail);
    };


    const onWaypointClick = (index: number) => {
        if (index < 0 || !missionDraft!.waypoints[index]) return;
        if (selectedWaypointIndices.indexOf(index) >= 0)
            props.mapWindow.csharp.deselectWaypoint(index);
        else
            props.mapWindow.csharp.selectWaypoint(index);
    };


    const GeoFenceChanged = (data: any) => {
        try {
            if (data.detail && missionDraft) {
                const draftMissionGeofenceChanged = missionDraft;
                draftMissionGeofenceChanged!.geoFence = data.detail;
                setMissionDraft(draftMissionGeofenceChanged)
            }
        } catch (e) {
            console.log(e)
        }
        //setIsDraft(true);
    }


    // @ts-ignore
    const DownloadMission = ({detail}) => {
        setMission(detail);
        setMissionDraft(detail);
        setIsDraft(true);
    }


    useEffect(() => {
        props.mapWindow.addEventListener("WaypointAdded", addWaypoint);
        props.mapWindow.addEventListener("WaypointChanged", changedWaypoint);
        props.mapWindow.addEventListener("WaypointRemoved", removeWaypoint);
        props.mapWindow.addEventListener("WaypointsCleared", clearWaypoints);

        props.mapWindow.addEventListener("CurrentWaypointChanged", setwayPoint);
        props.mapWindow.addEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
        props.mapWindow.addEventListener("editWaypoint", WaypointEditAction);
        props.mapWindow.addEventListener("GeoFenceChanged", GeoFenceChanged);
        props.mapWindow.addEventListener("DownloadMission", DownloadMission);
        return () => {
            props.mapWindow.removeEventListener("WaypointAdded", addWaypoint);
            props.mapWindow.removeEventListener("WaypointChanged", changedWaypoint);
            props.mapWindow.removeEventListener("WaypointRemoved", removeWaypoint);
            props.mapWindow.removeEventListener("WaypointsCleared", clearWaypoints);

            props.mapWindow.removeEventListener("CurrentWaypointChanged", setwayPoint);
            props.mapWindow.removeEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
            props.mapWindow.removeEventListener("editWaypoint", WaypointEditAction);
            props.mapWindow.removeEventListener("GeoFenceChanged", GeoFenceChanged);
            props.mapWindow.removeEventListener("DownloadMission", DownloadMission);
        };
    });


    const WaypointEditAction = (data: any) => {
        setwaypointModalStatus(true);
        if (!data.detail) setwaypointModalData(data);

        if (data.detail) {
            data.detail.agl = waypointsList[data.detail.index].agl;
            setwaypointModalData(data.detail);
        }
    }


    const setDraftMode = (e: boolean) => {
        console.log(e)
        if (e == true) {
            props.mapWindow.csharp.receivedMission({
                mission: {
                    waypoints: missionDraft?.waypoints,
                    home: missionDraft?.home,
                },
                geoFence: missionDraft?.geoFence,
                failsafe: missionDraft?.failsafe,
            }, false);
        }
        if (e == false) {
            props.mapWindow.csharp.receivedMission({
                mission: {
                    waypoints: missionData?.waypoints,
                    home: missionData?.home
                },
                geoFence: missionData?.geoFence,
                failsafe: missionData?.failsafe,
            }, false);
        }
        setIsDraft(e)
    }

    // @ts-ignore
    return (

        <div>

            {waypointModalData &&
            <ModalsWaypoint
                waypointModalStatus={waypointModalStatus}
                waypointModalData={waypointModalData}
                setwaypointModalData={setwaypointModalData}
                missionDraft={missionDraft as missionDataType}
                setwaypointModalStatus={(e: any) => {
                    setwaypointModalStatus(e)
                }}
                mapWindow={props.mapWindow}
            />}


            {missionData?.waypoints &&
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Source</th>
                    <th>Index</th>
                    <th>Command</th>
                    <th style={{width: "150px"}}>Latitude</th>
                    <th style={{width: "150px"}}>Longitude</th>
                    <th>Altitude</th>
                    <th>Parameter</th>
                    <th>Draf Mode</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{props.mapWindow.csharp.CommandSourceType[wayPointCurrent?.commandSource]}</td>
                    <td>{(wayPointCurrent?.commandSource)}</td>
                    <td>{wayPointCurrent?.command}</td>
                    <td>{wayPointCurrent?.latitude.toFixed(7)}</td>
                    <td>{wayPointCurrent?.longitude.toFixed(7)}</td>
                    <td>{wayPointCurrent?.altitude.toFixed(0)}</td>
                    <td>{wayPointCurrent?.parameter.toString()}</td>
                    <td><Switch onChange={(e) => {
                        setIsDraft(e)
                        setDraftMode(e);
                    }} checked={isDraft} height={15} width={40} className="react-switch"/></td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <Button onClick={() => {
                            console.log(missionData)
                        }} variant={"dark"} size="sm">Data</Button>
                    </td>

                    <td colSpan={2}><Button onClick={() => {
                        // @ts-ignore
                        //console.log(missionData.waypoints)
                        console.log(missionDraft)
                    }} variant={"warning"} size="sm">Draft Data
                    </Button></td>
                </tr>
                </tbody>
            </Table>}


            <Tabs defaultActiveKey="waypoints" transition={false} id="noanim-tab-example" className="mb-3">

                <Tab eventKey="waypoints" title="Waypoints">
                    <WaypointsTab
                        missionData={missionData as missionDataType}
                        missionDraft={missionDraft as missionDataType}
                        homeLocation={HomeLocation}
                        isDraft={isDraft}
                        currentMissionIndex={1}
                        defaultAgl={defaultAgl}
                        setDefaultAgl={setDefaultAgl}
                        WaypointEditAction={(e: any) => {
                            WaypointEditAction(e);
                        }}
                        onWaypointClick={onWaypointClick}
                        selectedWaypointIndices={selectedWaypointIndices}
                        jumpToWaypoint={
                            (index: number) => {
                                props.mapWindow.csharp.jumpToWaypoint(index)
                            }
                        }
                        clearWaypoints={() => {
                            props.mapWindow.csharp.clearWaypoints()
                        }
                        }
                    />
                </Tab>
                <Tab eventKey="Geofence" title="Geofence">
                    <GeoFenceTab
                        missionDraft={(missionDraft?.geoFence as geoFenceType)}
                        missionData={(missionData?.geoFence as geoFenceType)}
                        setGeoFenceActive={(e: any) => {
                            var newGeofence = GeoFenceData;
                            newGeofence.isActive = e.target.checked;
                            setGeoFenceData(newGeofence);
                        }}
                        isDraft={isDraft}
                        setGeoFenceVisible={(e: any) => {
                            var newGeofence = GeoFenceData;
                            newGeofence.isVisible = e.target.checked;
                            setGeoFenceData(newGeofence);
                        }}
                    ></GeoFenceTab>
                </Tab>
                <Tab eventKey="Failsafe" title="Failsafe">
                    <Failsafe csharp={props.mapWindow.csharp}/>
                </Tab>
                <Tab eventKey="RcCommands" title="Rc Commands">
                    Rc Commands
                </Tab>
            </Tabs>
        </div>


    );
}


export default SidebarTabs;
