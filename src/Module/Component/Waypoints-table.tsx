import React, {useState, useEffect} from 'react';
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'


function WaypointsTable(props: any) {

    let CommandListArray: any[];

    const [Agl, setAgl] = useState(400);
    const [isDraft, setIsDraft] = useState(false);
    const [CommandList, setCommandList] = useState<any>([]);
    const [wayPointCurrent, setwayPointCurrent] = useState<any>(null);
    const [selectWaypoint, setselectWaypoint] = useState<any>([]);
    const [HomeLocation, setHomeLocation] = useState<any>({
        latitude: 0,
        longitude: 0,
        altitude: 0,
    });

    // @ts-ignore
    const AddWaypoint = ({detail}) => {
        CommandListArray = [];
        setTimeout(() => {
            CommandListArray.push({
                index: detail.index,
                command: detail.command,
                latitude: detail.latitude,
                longitude: detail.longitude,
                altitude: detail.altitude,
                agl: Agl,
            })
            // @ts-ignore
            setCommandList([...CommandList, ...CommandListArray]);
            setIsDraft(true);
        }, 1500)

    };

    function ClearWaypoint() {
        setCommandList([]);
        setIsDraft(true);
    }

    const RemoveWaypoint = (e: { detail: any; }) => {
        // @ts-ignore
        const filteredData = CommandList.filter(({index: index}) => index !== e.detail);
        for (let i = 0; i < filteredData.length; i++) {
            // @ts-ignore
            filteredData[i].index = i;
        }
        setCommandList(filteredData);
        setIsDraft(true);
    };

    // @ts-ignore
    const SetMapHome = ({detail: {altitude: altitude, latitude: latitude, longitude: longitude}}) => {
        setHomeLocation({latitude: latitude, altitude: altitude, longitude: longitude});
        setIsDraft(true);
    };

    // @ts-ignore
    const ChangedWaypoint = ({detail: {altitude: altitude, command: command, index: index, latitude: latitude, longitude: longitude}}) => {
        setIsDraft(true);
        try {
            let newComandlistItem = [...CommandList];
            // @ts-ignore
            newComandlistItem[index].command = command;
            // @ts-ignore
            newComandlistItem[index].latitude = latitude;
            // @ts-ignore
            newComandlistItem[index].longitude = longitude;
            // @ts-ignore
            newComandlistItem[index].altitude = altitude;
            setCommandList(newComandlistItem);
        } catch (e) {
            console.log(e)
        }
    };

    // @ts-ignore
    const setwayPoint = (e) => {
        if (e.detail.waypoint) {
            setwayPointCurrent({
                commandSource: e.detail.commandSource,
                altitude: e.detail.waypoint.altitude,
                command: e.detail.waypoint.command,
                index: e.detail.waypoint.index,
                latitude: e.detail.waypoint.latitude,
                longitude: e.detail.waypoint.longitude,
            })
        }
    };

    // @ts-ignore
    const WaypointSelectionChanged = (e) => {
        //console.log(e.detail);
        setselectWaypoint(e.detail);
    };


    const WaypointSelectionEdit = (index: any) => {
        //console.log(selectWaypoint?.indexOf(index));
        //props.mapWindow.dispatchEvent(new CustomEvent('WaypointSelectionChanged', {detail: index}));
    };

    // @ts-ignore
    const setsAgl = ({target: {value: value}}) => setAgl(value)


    useEffect(() => {
        props.mapWindow.addEventListener("WaypointAdded", AddWaypoint);
        props.mapWindow.addEventListener("WaypointChanged", ChangedWaypoint);
        props.mapWindow.addEventListener("WaypointsCleared", ClearWaypoint);
        props.mapWindow.addEventListener("WaypointRemoved", RemoveWaypoint);
        props.mapWindow.addEventListener("HomeChanged", SetMapHome);
        props.mapWindow.addEventListener("CurrentWaypointChanged", setwayPoint);
        props.mapWindow.addEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
        return () => {
            props.mapWindow.removeEventListener("WaypointAdded", AddWaypoint);
            props.mapWindow.removeEventListener("WaypointChanged", ChangedWaypoint);
            props.mapWindow.removeEventListener("WaypointsCleared", ClearWaypoint);
            props.mapWindow.removeEventListener("WaypointRemoved", RemoveWaypoint);
            props.mapWindow.removeEventListener("HomeChanged", SetMapHome);
            props.mapWindow.removeEventListener("CurrentWaypointChanged", setwayPoint);
            props.mapWindow.removeEventListener("WaypointSelectionChanged", WaypointSelectionChanged);
        };
    });

    const jumpToWaypoint = (index: any) => {
        props.mapWindow.csharp.jumpToWaypoint(index)
    }

    // @ts-ignore
    return (
        <div>


            {CommandList &&
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Source</th>
                    <th>Index</th>
                    <th>Command</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Altitude</th>

                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{wayPointCurrent?.commandSource}</td>
                    <td>{(wayPointCurrent?.index + 1)}</td>
                    <td>{wayPointCurrent?.command}</td>
                    <td>{wayPointCurrent?.latitude}</td>
                    <td>{wayPointCurrent?.longitude}</td>
                    <td>{wayPointCurrent?.altitude}</td>
                </tr>
                </tbody>
            </Table>}


            <Tabs defaultActiveKey="waypoints" transition={false} id="noanim-tab-example" className="mb-3">

                <Tab eventKey="waypoints" title="Waypoints">

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Altitude</th>
                            <th>Altitude Over</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{HomeLocation.latitude}</td>
                            <td>{HomeLocation.longitude}</td>
                            <td>{HomeLocation.altitude.toFixed(0)}</td>
                            <td><input type="number" value={Agl} onChange={e => setsAgl(e)}/> m</td>
                        </tr>
                        </tbody>
                    </Table>

                    <div style={{height: '260px', overflow: 'scroll'}}>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Command</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>MSL</th>
                                <th>AGL</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {// @ts-ignore
                                CommandList.map(({agl: agl, altitude: altitude, command: command, latitude: latitude, longitude: longitude}, index) => {

                                        return (
                                            <tr
                                                onClick={() => {
                                                    WaypointSelectionEdit(index)
                                                }}
                                                key={index}
                                                className={(index == wayPointCurrent?.index ? 'select-red' : '') + (selectWaypoint?.indexOf(index) >= 0 ? ' select-grey' : '')}
                                            >
                                                <td>{(index + 1)}</td>
                                                <td>{command}</td>
                                                <td>{latitude}</td>
                                                <td>{longitude}</td>
                                                <td>{altitude} m</td>
                                                <td>{agl} m</td>
                                                <td>
                                                    <Button style={{fontSize: "10px"}} variant="primary" size="sm"
                                                            className="m-0 p-1 pl-0 pr-0" onClick={() => {
                                                        jumpToWaypoint(index)
                                                    }}>Jump</Button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>
                        </Table>
                    </div>
                </Tab>
                <Tab eventKey="Geofence" title="Geofence">
                    Geofence
                </Tab>
                <Tab eventKey="Failsafe" title="Failsafe">
                    Failsafe
                </Tab>
                <Tab eventKey="RcCommands" title="Rc Commands">
                    Rc Commands
                </Tab>
            </Tabs>
        </div>


    );
}


export default WaypointsTable;
