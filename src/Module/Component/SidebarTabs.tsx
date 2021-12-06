import React, {useState, useEffect} from 'react';
import {Table, Button, Tabs, Tab} from 'react-bootstrap'
import Switch from 'react-switch';
import clone from 'clone';


import WaypointsTab from "./SidebarTabsComp/WaypointsTab";
import GeoFenceTab from "./SidebarTabsComp/GeoFenceTab";
import Failsafe from "./SidebarTabsComp/Failsafe";
import ModalsWaypoint from "./waypointModal";
import {geoFenceType, missionDataType} from "../models/missionTypes";

function SidebarTabs(props: any) {
    const useDraftLogic: boolean = false;
    const [defaultAgl, setDefaultAgl] = useState<number>(400);
    const [isDraft, setIsDraft] = useState<boolean>(false);
    const [missionData, setMissionData] = useState<missionDataType>(); //Mission
    const [missionDraft, setMissionDraft] = useState<missionDataType>(); //MissionDraft

    const [wayPointCurrent, setwayPointCurrent] = useState<any>(null);
    const [selectedWaypointIndices, setSelectedWaypointIndices] = useState<number[]>([]);
    const [waypointModalStatus, setwaypointModalStatus] = useState<boolean>(false);
    const [waypointModalData, setwaypointModalData] = useState<any>();

    const [GeoFenceData, setGeoFenceData] = useState<any>([]);


    /*
     * Waypoint Operation Start
     */


    const addWaypoint = (input: any) => {
        const detail = input.detail;
        if (detail.missionUpdateOrigin == null || detail.missionUpdateOrigin !== 'draft-toggle') {
            try {
                if (missionDraft) {
                    missionDraft.waypoints.push({...detail, agl: defaultAgl})
                    setMissionDraft(missionDraft);
                    if (!isDraft && useDraftLogic)
                        setIsDraft(true);
                }
            } catch (e) {
                console.log(e)
            }
        }
    };

    const changedWaypoint = (e: { detail: any; }) => {
        try {
            let ss = missionDraft!;
            ss.waypoints[e.detail.index] = {...e.detail, agl: defaultAgl};
            setMissionDraft(ss);
            if (!isDraft && useDraftLogic)
                setIsDraft(true);
        } catch (e) {
            console.log(e)
        }
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
            if (!isDraft && useDraftLogic)
                setIsDraft(true);
        } catch (e) {
            console.log(e)
        }
    }

    const clearWaypoints = (e: { detail: any; }) => {
        if (e.detail == null || e.detail !== 'draft-toggle') {
            try {
                if (missionDraft) {
                    missionDraft!.waypoints = [];
                    setMissionDraft(missionDraft);
                    if (!isDraft && useDraftLogic)
                        setIsDraft(true);
                }
            } catch (e) {
                console.log(e)
            }
        }
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
                commandSource: e.detail.commandSource,
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
                if (!useDraftLogic) {
                    const MissionGeofenceChangeData = missionData;
                    MissionGeofenceChangeData!.geoFence = data.detail;
                    setMissionDraft(MissionGeofenceChangeData)
                    console.log(missionData)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    // @ts-ignore
    const DownloadMission = ({detail}) => {
        setMissionData(clone(detail));
        setMissionDraft(clone(detail));
        setIsDraft(false);
    }

    // @ts-ignore
    function SetMapHome(e) {
        if (e.detail) {
            try {
                if (missionDraft) {
                    missionDraft.home = e.detail;
                    setMissionDraft(missionDraft);
                    if (!isDraft && useDraftLogic)
                        setIsDraft(true);
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    useEffect(() => {
        props.mapWindow.addEventListener("WaypointAdded", addWaypoint);
        props.mapWindow.addEventListener("WaypointChanged", changedWaypoint);
        props.mapWindow.addEventListener("WaypointRemoved", removeWaypoint);
        props.mapWindow.addEventListener("WaypointsCleared", clearWaypoints);
        props.mapWindow.addEventListener("HomeChanged", SetMapHome);
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
            props.mapWindow.removeEventListener("HomeChanged", SetMapHome);
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

        // todo: what are we doing in here?
        if (data.detail) {
            data.detail.agl = 100; // todo: what is the correct value?
            setwaypointModalData(data.detail);
        }
    }

    const sendMission = (mission: missionDataType) => {
        props.mapWindow.csharp.receivedMission({
            mission: {
                waypoints: mission?.waypoints,
                home: mission?.home,
            },
            geoFence: mission?.geoFence,
            failsafe: mission?.failsafe,
        }, 'draft-toggle');
    }

    // @ts-ignore
    return (
        <div>
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
                    <th style={{display: useDraftLogic ? "block" : "none"}}>
                        Draft Mode
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{props.mapWindow.csharp.CommandSourceType[wayPointCurrent?.commandSource]}</td>
                    <td>{(wayPointCurrent?.index + 1)}</td>
                    <td>{wayPointCurrent?.command}</td>
                    <td>{wayPointCurrent?.latitude.toFixed(7)}</td>
                    <td>{wayPointCurrent?.longitude.toFixed(7)}</td>
                    <td>{wayPointCurrent?.altitude.toFixed(0)}</td>
                    <td>{wayPointCurrent?.parameter.toString()}</td>
                    <td style={{display: useDraftLogic ? "block" : "none"}}>
                        <Switch checked={isDraft} height={15} width={40} className="react-switch"
                                onChange={(isDraftValue: boolean) => {
                                    if (useDraftLogic) {
                                        setIsDraft(isDraftValue);
                                        let mission = isDraftValue ? clone(missionDraft) : clone(missionData);
                                        sendMission(mission!);
                                    }
                                }}/>
                    </td>
                </tr>

                </tbody>
            </Table>}

            <Tabs defaultActiveKey="waypoints" transition={false} id="noanim-tab-example" className="mb-3">
                <Tab eventKey="waypoints" title="Waypoints">
                    <WaypointsTab
                        missionWaypoints={isDraft || !useDraftLogic ? missionDraft! : missionData!}
                        isDraft={isDraft}
                        currentMissionIndex={wayPointCurrent?.index}
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
                        missionGeofence={isDraft || !useDraftLogic ? missionDraft?.geoFence! : missionData?.geoFence!}
                        setGeoFenceActive={(e: any) => {
                            var newGeofence = null;
                            if (isDraft || !useDraftLogic) {
                                newGeofence = missionDraft;
                                newGeofence!.geoFence.isActive = e;
                                setMissionDraft(newGeofence);
                            } else {
                                newGeofence = missionData!;
                                newGeofence.geoFence.isActive = e;
                                setMissionData(newGeofence);
                            }
                            props.mapWindow.csharp.geoFenceActive(e);
                        }}
                        isDraft={isDraft}
                        setGeoFenceVisible={(e: any) => {
                            var newGeofence = null;
                            if (isDraft || !useDraftLogic) {
                                newGeofence = missionDraft;
                                newGeofence!.geoFence.isVisible = e.target.checked;
                                setMissionDraft(newGeofence);
                            } else {
                                newGeofence = missionData!;
                                newGeofence.geoFence.isVisible = e.target.checked;
                                setMissionData(newGeofence);
                            }
                        }}
                        csharp={props.mapWindow.csharp}
                    ></GeoFenceTab>
                </Tab>
                <Tab eventKey="Failsafe" title="Failsafe">
                    <Failsafe
                        missionFailsafe={isDraft || !useDraftLogic ? missionDraft : missionData}
                        csharp={props.mapWindow.csharp}/>
                </Tab>
                <Tab eventKey="RcCommands" title="Rc Commands">
                    Rc Commands
                </Tab>
            </Tabs>

            {waypointModalData &&
            <ModalsWaypoint
                missionWaypoints={isDraft || !useDraftLogic ? missionDraft! : missionData!}
                waypointModalStatus={waypointModalStatus}
                waypointModalData={waypointModalData}
                setwaypointModalData={setwaypointModalData}
                setwaypointModalStatus={(e: any) => {
                    setwaypointModalStatus(e)
                }}
                mapWindow={props.mapWindow}
            />
            }
        </div>
    );
}


export default SidebarTabs;
