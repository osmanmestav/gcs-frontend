import React, {useState, useEffect} from 'react';
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

function WaypointsTable() {

    let CommandListArray = [];
    const [Agl, setAgl] = useState(400);
    const [CommandList, setCommandList] = useState([]);
    const [HomeLocation, setHomeLocation] = useState({
        latitude: 0,
        longitude: 0,
        altitude: 0,
    });

    function AddWaypoint(e) {
        CommandListArray.splice();
        CommandListArray.push({
            index: e.detail.index,
            command: e.detail.command,
            latitude: e.detail.latitude,
            longitude: e.detail.longitude,
            altitude: e.detail.altitude,
            agl: Agl,
        })
        setCommandList([...CommandList, ...CommandListArray]);
    }

    function ClearWaypoint() {
        setCommandList([]);
    }

    function RemoveWaypoint(e) {
        const filteredData = CommandList.filter(item => item.index !== e.detail);
        for (let i = 0; i < filteredData.length; i++) {
            filteredData[i].index = i;
        }
        setCommandList(filteredData);
    }

    function SetMapHome(e) {
        setHomeLocation({latitude: e.detail.latitude, altitude: e.detail.altitude, longitude: e.detail.longitude})
    }

    function ChangedWaypoint(e) {
        try {
            let newComandlistItem = [...CommandList];
            newComandlistItem[e.detail.index].command = e.detail.command;
            newComandlistItem[e.detail.index].latitude = e.detail.latitude;
            newComandlistItem[e.detail.index].longitude = e.detail.longitude;
            newComandlistItem[e.detail.index].altitude = e.detail.altitude;
            setCommandList(newComandlistItem);
        } catch (e) {
            console.log(e)
        }
    }


    useEffect(() => {
        document.getElementById('gcsMap').contentWindow.addEventListener("WaypointAdded", AddWaypoint);
        document.getElementById('gcsMap').contentWindow.addEventListener("WaypointChanged", ChangedWaypoint);
        document.getElementById('gcsMap').contentWindow.addEventListener("WaypointsCleared", ClearWaypoint);
        document.getElementById('gcsMap').contentWindow.addEventListener("WaypointRemoved", RemoveWaypoint);
        document.getElementById('gcsMap').contentWindow.addEventListener("HomeChanged", SetMapHome);
        return () => {
            document.getElementById('gcsMap').contentWindow.removeEventListener("WaypointAdded", AddWaypoint);
            document.getElementById('gcsMap').contentWindow.removeEventListener("WaypointChanged", ChangedWaypoint);
            document.getElementById('gcsMap').contentWindow.removeEventListener("WaypointsCleared", ClearWaypoint);
            document.getElementById('gcsMap').contentWindow.removeEventListener("WaypointRemoved", RemoveWaypoint);
            document.getElementById('gcsMap').contentWindow.removeEventListener("HomeChanged", SetMapHome);
        };
    });

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
                            <td><input type="number" value={Agl} onChange={e => setAgl(e.target.value)}/> m</td>
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
                        {CommandList.map((data, index) =>
                            <tr key={index}>
                                <td>{(index + 1)}</td>
                                <td>{data.command}</td>
                                <td>{data.latitude}</td>
                                <td>{data.longitude}</td>
                                <td>{data.altitude.toFixed(0)} m</td>
                                <td>{data.agl} m</td>
                                <td></td>
                                <td><Button variant="primary" size="sm">Jump</Button></td>
                            </tr>
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
