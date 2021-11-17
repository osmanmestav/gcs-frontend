import React from 'react';
import {Table, Button, Form} from 'react-bootstrap'


function GeoFenceTab(props: any) {
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
                    <td>{props.GeoFenceData?.returnPoint?.latitude.toFixed(7)}</td>
                    <td>{props.GeoFenceData?.returnPoint?.longitude.toFixed(7)}</td>
                    <td>{props.GeoFenceData?.maxAltitude?.toFixed(7)}</td>
                    <td>{props.GeoFenceData?.minAltitude?.toFixed(7)}</td>
                    <td>
                        <Form.Check
                            label="Active"
                            name="command"
                            inline
                            type="checkbox"
                            id={"inline2"}
                            checked={(props.GeoFenceData.isActive)}
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
                            checked={(props.GeoFenceData.isVisible)}
                            onChange={(e) => {
                                props.setGeoFenceVisible(e)
                            }}

                        />
                    </td>
                </tr>
                </tbody>
            </Table>
            {props.GeoFenceData != "" &&
            <div style={{height: '260px', overflow: 'scroll'}}>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Latitude</th>
                        <th>Longitude</th>
                    </tr>
                    </thead>
                    <tbody>
                    {// @ts-ignore
                        props.GeoFenceData.points.map((data, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{data.latitude.toFixed(7)}</td>
                                        <td>{data.longitude.toFixed(7)}</td>
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
