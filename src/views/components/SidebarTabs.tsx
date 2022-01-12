import React, {useState, useEffect} from 'react';
import {Table, Tabs, Tab} from 'react-bootstrap'
import Switch from 'react-switch';
import clone from 'clone';


import WaypointsTab from "./SidebarTabsComp/WaypointsTab";
import GeoFenceTab from "./SidebarTabsComp/GeoFenceTab";
import Failsafe from "./SidebarTabsComp/Failsafe";
import ModalsWaypoint from "./waypointModal";
import {missionDataType, waypointDataType} from "../viewModels/missionTypes";

function SidebarTabs(props: any) {
    const useDraftLogic: boolean = false;
    const [defaultAgl, setDefaultAgl] = useState<number>(400);
    const [isDraft, setIsDraft] = useState<boolean>(false);
    const [missionData, setMissionData] = useState<missionDataType>(); //Mission
    const [missionDraft, setMissionDraft] = useState<missionDataType>(); //MissionDraft

    const [wayPointCurrent, setwayPointCurrent] = useState<any>(null);
    const [selectedWaypointIndices, setSelectedWaypointIndices] = useState<number[]>([]);
    const [modalIndex, setModalIndex] = useState<number>(-1);

    /*
     * Waypoint Operation Start
     */


    const addWaypoint = (input: any) => {
        const detail = input.detail;
        if (detail.missionUpdateOrigin == null || detail.missionUpdateOrigin !== 'draft-toggle') {
            try {
                if (missionDraft) {
                    console.log(missionDraft)
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
            console.log(e.detail)
            if (!e.detail.agl) e.detail.agl = defaultAgl;
            let ss = missionDraft!;
            ss.waypoints[e.detail.index] = {...e.detail};
            setMissionDraft(ss);
            if (!isDraft && useDraftLogic)
                setIsDraft(true);
        } catch (e) {
            console.log(e)
        }
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
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    // @ts-ignore
    const DownloadMission = ({detail}) => {
        for (let i = 0; i < detail.waypoints.length; i++) {
            detail.waypoints[i].agl = defaultAgl;
        }
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
        if (data.detail)
            setModalIndex(data.detail.index);
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

    const onCloseModal = (saveChanges: boolean, editedWaypoints: waypointDataType[] | null) => {
        if (saveChanges && editedWaypoints != null) {
            if (isDraft || !useDraftLogic) {
                editedWaypoints.forEach((w, index) => {
                    w.index = index;
                    props.mapWindow.csharp.updateWaypoint(w);
                    missionDraft!.waypoints[w.index].agl = w.agl;
                })
                setMissionDraft(missionDraft);
            } else {
                editedWaypoints.forEach((w, index) => {
                    w.index = index;
                    props.mapWindow.csharp.updateWaypoint(w);
                    missionData!.waypoints[w.index].agl = w.agl;
                })
                setMissionData(missionData);
            }
        }
        let mission = clone(missionDraft);
        props.mapWindow.csharp.receivedMission({
            mission: {
                waypoints: mission?.waypoints,
                home: mission?.home,
            },
            geoFence: mission?.geoFence,
            failsafe: mission?.failsafe,
        }, 'draft-toggle');

        if (!isDraft && useDraftLogic)
            setIsDraft(true);
        setModalIndex(-1);
    }


    const setGeoFenceActive = (e: boolean) => {
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
    }
    const setGeoFenceVisible = (e: boolean) => {
        var newGeofence = null;
        if (isDraft || !useDraftLogic) {
            newGeofence = missionDraft;
            newGeofence!.geoFence.isVisible = e;
            setMissionDraft(newGeofence);
        } else {
            newGeofence = missionData!;
            newGeofence.geoFence.isVisible = e;
            setMissionData(newGeofence);
        }
        console.log(e)
        props.mapWindow.csharp.setGeoFenceVisibility(e);
    }

    const indexWaypointEdit = (e: any) => {
        if (!e.destination) return;
        try {
            let tempData = Array.from(missionDraft!.waypoints);
            let [source_data] = tempData.splice(e.source.index, 1);
            tempData.splice(e.destination.index, 0, source_data);
            var newMissionDraft = missionDraft;
            newMissionDraft!.waypoints = tempData;
            setMissionDraft(newMissionDraft);

            let mission = clone(missionDraft);
            props.mapWindow.csharp.receivedMission({
                mission: {
                    waypoints: mission?.waypoints,
                    home: mission?.home,
                },
                geoFence: mission?.geoFence,
                failsafe: mission?.failsafe,
            }, 'draft-toggle');


            if (!isDraft && useDraftLogic)
                setIsDraft(true);
        } catch (e) {
            console.log(e)
        }
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
                        <Switch
                            disabled={props.isMissionEditable === false}
                            className="react-switch"
                            checked={isDraft}
                            height={15}
                            width={40}
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
                        isMissionEditable={props.isMissionEditable}
                        missionWaypoints={isDraft || !useDraftLogic ? missionDraft! : missionData!}
                        isDraft={isDraft}
                        currentMissionIndex={wayPointCurrent?.index}
                        defaultAgl={defaultAgl}
                        setDefaultAgl={(e: number) => {
                            props.mapWindow.csharp.setAltitudeOverHome(e)
                            setDefaultAgl(e);
                        }}
                        WaypointEditAction={(e: any) => WaypointEditAction(e)}
                        onWaypointClick={onWaypointClick}
                        selectedWaypointIndices={selectedWaypointIndices}
                        jumpToWaypoint={(index: number) => props.mapWindow.csharp.jumpToWaypoint(index)}
                        clearWaypoints={() => props.mapWindow.csharp.clearWaypoints()}
                        setIndexWaypoints={(e: any) => indexWaypointEdit(e)}
                    />
                </Tab>
                <Tab eventKey="Geofence" title="Geofence">
                    <GeoFenceTab
                        isMissionEditable={props.isMissionEditable}
                        missionGeofence={isDraft || !useDraftLogic ? missionDraft?.geoFence! : missionData?.geoFence!}
                        setGeoFenceActive={(e: boolean) => setGeoFenceActive(e)}
                        isDraft={isDraft}
                        setGeoFenceVisible={(e: boolean) => setGeoFenceVisible(e)}
                        csharp={props.mapWindow.csharp}
                    ></GeoFenceTab>
                </Tab>
                <Tab eventKey="Failsafe" title="Failsafe">
                    <Failsafe
                        isMissionEditable={props.isMissionEditable}
                        missionFailsafe={isDraft || !useDraftLogic ? missionDraft : missionData}
                        csharp={props.mapWindow.csharp}/>
                </Tab>
            </Tabs>

            {
                modalIndex !== -1 ?
                    <ModalsWaypoint
                        missionWaypoints={isDraft || !useDraftLogic ? missionDraft!.waypoints : missionData!.waypoints}
                        show={modalIndex !== -1}
                        editIndex={modalIndex}
                        onCloseModal={onCloseModal}
                    />
                    : null
            }
        </div>
    );
}


export default SidebarTabs;
