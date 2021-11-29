import React, {useState, useEffect} from 'react';
import {Form, Table, Button, ButtonGroup, Tabs, Tab, Modal} from 'react-bootstrap'
import Switch from "react-switch";


import WaypointsTab from "./SidebarTabsComp/WaypointsTab";
import GeoFenceTab from "./SidebarTabsComp/GeoFenceTab";
import Failsafe from "./SidebarTabsComp/Failsafe";
import ModalsWaypoint from "./waypointModal";
import {missionDataType} from "../models/missionTypes";
import {debug} from "webpack";

function WaypointsTable(props: any) {

    let waypointsListArray: any[];

    const [defaultAgl, setDefaultAgl] = useState<number>(400);
    const [isDraft, setIsDraft] = useState<boolean>(false);
    const [missionData, setMission] = useState<object>({}); //Mission
    const [missionDraft, setMissionDraft] = useState<object>({}); //MissionDraft


    const [waypointsList, setwaypointsList] = useState<any>([]); //CommandList
    const [Draft, setDraft] = useState<any>([]); //CommandList
    const [wayPointCurrent, setwayPointCurrent] = useState<any>(null);
    const [selectedWaypointIndices, setSelectedWaypointIndices] = useState<number[]>([]);
    const [HomeLocation, setHomeLocation] = useState<any>({
        latitude: 0,
        longitude: 0,
        altitude: 0,
    });
    const [waypointEditModal, setwaypointEditModal] = useState(false);
    const [waypointEditModalData, setwaypointEditModalData] = useState<any>();

    const [GeoFenceData, setGeoFenceData] = useState<any>([]);


    // @ts-ignore
    const AddWaypoint = ({detail}) => {
        console.log(detail)
        debugger
        if (detail.isFromDownload == undefined) {
            try {

                var a = (missionDraft as any);
                a.waypoints.push({...detail, agl: defaultAgl})
                console.log(a)
                // @ts-ignore
                setMissionDraft(a);

            } catch (e) {
                console.log(e)
            }
            setIsDraft(true);
            console.log(12312)
        }
    };


    // @ts-ignore
    const DownloadMission = ({detail}) => {
        setMission(detail);
        setMissionDraft(detail);
        setIsDraft(false);
    }

    const ClearWaypoint = () => {
        const newMissionDraft = missionDraft;
        (newMissionDraft as any).waypoints = [];
        setMission(newMissionDraft);
        setIsDraft(true);
    }

    const RemoveWaypoint = (e: { detail: any; }) => {
        // @ts-ignore
        const filteredData = missionDraft.waypoints.filter(({index: index}) => index !== e.detail);
        for (let i = 0; i < filteredData.length; i++) {
            // @ts-ignore
            filteredData[i].index = i;
        }

        var newMissionDraft = missionDraft;
        (newMissionDraft as any).waypoints = filteredData;
        setMission(newMissionDraft);
        //setwaypointsList(filteredData);
        setIsDraft(true);
    };


    // @ts-ignore
    const ChangedWaypoint = (e) => {
        setIsDraft(true);
        try {
            let newComandlistItem = [...waypointsList];
            debugger
            // @ts-ignore
            newComandlistItem[e.detail.index] = {...e.detail, agl: defaultAgl};
            setwaypointsList(newComandlistItem);
        } catch (e) {
            console.log(e)
        }
    };

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
        if (index < 0 || !waypointsList[index]) return;
        if (selectedWaypointIndices.indexOf(index) >= 0)
            props.mapWindow.csharp.deselectWaypoint(index);
        else
            props.mapWindow.csharp.selectWaypoint(index);
    };

    // @ts-ignore
    const GeoFenceChanged = (data) => {
        //console.log(data.detail)
        setGeoFenceData(data.detail);
    }

    useEffect(() => {
        props.mapWindow.addEventListener("WaypointAdded", AddWaypoint);
        props.mapWindow.addEventListener("WaypointChanged", ChangedWaypoint);
        props.mapWindow.addEventListener("WaypointsCleared", ClearWaypoint);
        props.mapWindow.addEventListener("WaypointRemoved", RemoveWaypoint);

        props.mapWindow.addEventListener("CurrentWaypointChanged", setwayPoint);
        props.mapWindow.addEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
        props.mapWindow.addEventListener("editWaypoint", WaypointEditAction);
        props.mapWindow.addEventListener("GeoFenceChanged", GeoFenceChanged);
        props.mapWindow.addEventListener("DownloadMission", DownloadMission);
        return () => {
            props.mapWindow.removeEventListener("WaypointAdded", AddWaypoint);
            props.mapWindow.removeEventListener("WaypointChanged", ChangedWaypoint);
            props.mapWindow.removeEventListener("WaypointsCleared", ClearWaypoint);
            props.mapWindow.removeEventListener("WaypointRemoved", RemoveWaypoint);

            props.mapWindow.removeEventListener("CurrentWaypointChanged", setwayPoint);
            props.mapWindow.removeEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
            props.mapWindow.removeEventListener("editWaypoint", WaypointEditAction);
            props.mapWindow.removeEventListener("GeoFenceChanged", GeoFenceChanged);
            props.mapWindow.removeEventListener("DownloadMission", DownloadMission);
        };
    });


    const WaypointEditAction = (data: any) => {
        setwaypointEditModal(true);
        if (!data.detail) setwaypointEditModalData(data);

        if (data.detail) {
            data.detail.agl = waypointsList[data.detail.index].agl;
            setwaypointEditModalData(data.detail);
        }
    }


    // @ts-ignore
    return (

        <div>

            {waypointEditModalData &&
            <ModalsWaypoint
                waypointEditModal={waypointEditModal}
                waypointEditModalData={waypointEditModalData}
                setwaypointEditModalData={setwaypointEditModalData}
                waypointsList={waypointsList}
                setwayPoint={setwayPoint}
                setwaypointEditModal={(e: any) => {
                    setwaypointEditModal(e)
                }}
                mapWindow={props.mapWindow}
            />}


            {(missionData as any).waypoints &&
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
                        console.log(e)
                        setIsDraft(e)
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
                        GeoFenceData={GeoFenceData}
                        setGeoFenceActive={(e: any) => {
                            var newGeofence = GeoFenceData;
                            newGeofence.isActive = e.target.checked;
                            setGeoFenceData(newGeofence);
                        }}
                        setGeoFenceVisible={(e: any) => {
                            var newGeofence = GeoFenceData;
                            newGeofence.isVisible = e.target.checked;
                            setGeoFenceData(newGeofence);
                        }}
                    ></GeoFenceTab>
                </Tab>
                <Tab eventKey="Failsafe" title="Failsafe">
                    <Failsafe
                        csharp={props.mapWindow.csharp}
                    />
                </Tab>
                <Tab eventKey="RcCommands" title="Rc Commands">
                    Rc Commands
                </Tab>
            </Tabs>
        </div>


    );
}


export default WaypointsTable;
