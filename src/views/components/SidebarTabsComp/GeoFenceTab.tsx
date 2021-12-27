import React, {useEffect, useState} from 'react';
import {Table, Button, Form} from 'react-bootstrap'
import {geoFenceType} from "../../viewModels/missionTypes";
import Switch from 'react-switch';

type GeoFenceTabProps = {
    missionGeofence: geoFenceType;
    setGeoFenceActive: (val: any) => void;
    setGeoFenceVisible: (val: boolean) => void;
    isDraft: boolean;
    isMissionEditable: boolean;
    csharp: any;
}

function GeoFenceTab(props: GeoFenceTabProps) {
    const [geoFenceData, setGeoFenceData] = useState<geoFenceType>();

    useEffect(() => {
        setGeoFenceData(props.missionGeofence);
    }, [props.missionGeofence])

    const clearGeoFenceClick = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        props.csharp.clearGeoFence();
        var geofence = geoFenceData;
        geofence!.points = [];
        setGeoFenceData(geofence)
    }

    // @ts-ignore
    return (
        <div>

            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>RetLat</th>
                    <th>RetLon</th>
                    <th>MinAlt</th>
                    <th>MaxAlt</th>
                    <th>
                        <Button
                            disabled={props.isMissionEditable === false}
                            style={{fontSize: "10px"}}
                            size="sm"
                            variant="secondary"
                            onClick={() => clearGeoFenceClick()}>Clear
                        </Button>
                        <Switch
                            disabled={props.isDraft || props.isMissionEditable === false}
                            checked={(geoFenceData?.isActive as any)}
                            height={15}
                            width={40}
                            className="switch-geofence"
                            onChange={(activeValue: boolean) => props.setGeoFenceActive(activeValue)}
                        />
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{geoFenceData?.returnPoint?.latitude?.toFixed(7)}</td>
                    <td>{geoFenceData?.returnPoint?.longitude?.toFixed(7)}</td>
                    <td>{geoFenceData?.maxAltitude?.toFixed(7)}</td>
                    <td>{geoFenceData?.minAltitude?.toFixed(7)}</td>
                    <td>

                        <Form.Check
                            disabled={props.isMissionEditable === false}
                            label="Visible"
                            inline
                            name="command"
                            type="checkbox"
                            id={"inline2"}
                            checked={(geoFenceData?.isVisible)}
                            onChange={(e) => {
                                props.setGeoFenceVisible(e.target.checked)
                            }}
                        />
                    </td>
                </tr>
                </tbody>
            </Table>
            {geoFenceData && geoFenceData.points.length > 0 &&
            <div style={{height: '260px', overflow: 'scroll'}}>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Index</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        geoFenceData.points.map((point, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{(index + 1)}</td>
                                        <td>{point.latitude.toFixed(7)}</td>
                                        <td>{point.longitude.toFixed(7)}</td>
                                    </tr>
                                );
                            }
                        )
                    }
                    </tbody>
                </Table>
            </div>}
        </div>
    );
}

export default GeoFenceTab;
