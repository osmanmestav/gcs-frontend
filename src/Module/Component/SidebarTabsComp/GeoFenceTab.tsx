import React, {useEffect, useState} from 'react';
import {Table, Button, Form} from 'react-bootstrap'
import {geoFenceType, missionDataType} from "../../models/missionTypes";

type GeoFenceTabType = {
    missionGeofence: geoFenceType;
    setGeoFenceActive: (val: any) => void;
    setGeoFenceVisible: (val: any) => void;
    isDraft: boolean;
}

function GeoFenceTab(props: GeoFenceTabType) {
    const [geoFenceData, setGeoFenceData] = useState<geoFenceType>();


    useEffect(() => {
        setGeoFenceData(props.missionGeofence);
    }, [props.isDraft])

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
                        <Button style={{fontSize: "10px"}} size="sm" variant="secondary">Clear</Button>
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
                            label="Active"
                            name="command"
                            inline
                            type="checkbox"
                            id={"inline2"}
                            checked={(geoFenceData?.isActive)}
                            onChange={(e) => {
                                props.setGeoFenceActive(e)
                            }}
                        />

                        <Form.Check
                            label="Visible"
                            inline
                            name="command"
                            type="checkbox"
                            id={"inline2"}
                            checked={(geoFenceData?.isVisible)}
                            onChange={(e) => {
                                props.setGeoFenceVisible(e)
                            }}

                        />
                    </td>
                </tr>
                </tbody>
            </Table>
            {geoFenceData &&
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
                    {// @ts-ignore
                        geoFenceData.points.map((data, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{(index + 1)}</td>
                                        <td>{(data as any)?.latitude.toFixed(7)}</td>
                                        <td>{(data as any)?.longitude.toFixed(7)}</td>
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
