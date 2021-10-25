import React, {useState, useEffect} from 'react';
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'


function WaypointsTable(props: any) {

    let CommandListArray: any[];

    const [Agl, setAgl] = useState(400);
    const [CommandList, setCommandList] = useState<any>([]);
    const [HomeLocation, setHomeLocation] = useState<any>({
        latitude: 0,
        longitude: 0,
        altitude: 0,
    });

    // @ts-ignore
    const AddWaypoint = ({detail}) => {
        CommandListArray = [];
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
    };

    function ClearWaypoint() {
        setCommandList([]);
    }

    const RemoveWaypoint = (e: { detail: any; }) => {
        // @ts-ignore
        const filteredData = CommandList.filter(({index: index}) => index !== e.detail);
        for (let i = 0; i < filteredData.length; i++) {
            // @ts-ignore
            filteredData[i].index = i;
        }
        setCommandList(filteredData);
    };

    // @ts-ignore
    const SetMapHome = ({detail: {altitude: altitude, latitude: latitude, longitude: longitude}}) => {
        setHomeLocation({latitude: latitude, altitude: altitude, longitude: longitude})
    };

    // @ts-ignore
    const ChangedWaypoint = ({detail: {altitude: altitude, command: command, index: index, latitude: latitude, longitude: longitude}}) => {
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
    const setsAgl = ({target: {value: value}}) => setAgl(value)


    useEffect(() => {
        props.mapWindow.addEventListener("WaypointAdded", AddWaypoint);
        props.mapWindow.addEventListener("WaypointChanged", ChangedWaypoint);
        props.mapWindow.addEventListener("WaypointsCleared", ClearWaypoint);
        props.mapWindow.addEventListener("WaypointRemoved", RemoveWaypoint);
        props.mapWindow.addEventListener("HomeChanged", SetMapHome);
        return () => {
            props.mapWindow.removeEventListener("WaypointAdded", AddWaypoint);
            props.mapWindow.removeEventListener("WaypointChanged", ChangedWaypoint);
            props.mapWindow.removeEventListener("WaypointsCleared", ClearWaypoint);
            props.mapWindow.removeEventListener("WaypointRemoved", RemoveWaypoint);
            props.mapWindow.removeEventListener("HomeChanged", SetMapHome);
        };
    });

    const jumpToWaypoint = (index: any) => {
        props.mapWindow.csharp.jumpToWaypoint(index)
    }

    // @ts-ignore
    return (
        <div style={{height: '450px', minHeight: '400px', overflow: 'scroll'}}>

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

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Command</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>MSL</th>
                            <th>AGL</th>
                            <th>Parameter</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {// @ts-ignore
                            CommandList.map(({agl: agl, altitude: altitude, command: command, latitude: latitude, longitude: longitude}, index) => {
                                    return <tr key={index}>
                                        <td>{(index + 1)}</td>
                                        <td>{command}</td>
                                        <td>{latitude}</td>
                                        <td>{longitude}</td>
                                        <td>{altitude} m</td>
                                        <td>{agl} m</td>
                                        <td></td>
                                        <td>
                                            <Button variant="primary" size="sm" onClick={() => {
                                                jumpToWaypoint(index)
                                            }}>Jump</Button>
                                        </td>
                                    </tr>;
                                }
                            )}

                        </tbody>
                    </Table>
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
