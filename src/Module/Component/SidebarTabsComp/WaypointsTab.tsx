import React from 'react';
import {Table, Button, ButtonGroup} from 'react-bootstrap'
import GeoLocationModel from '../../models/geoLocationModel';

type WaypointsTabProps = {
    jumpToWaypoint: (index: number) => void;
    HomeLocation: GeoLocationModel;
    defaultAgl: number;
    setDefaultAgl: (val: number) => void;
    CommandList: any[];
    wayPointCurrent: any;
    selectedWaypointIndices: number[];
    WaypointEditAction: any;
    onWaypointClick: (index: number) => void;
}

function WaypointsTab(props: WaypointsTabProps) {
    // @ts-ignore
    return (
        <div>
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
                    <td>{props.HomeLocation.latitude.toFixed(7)}</td>
                    <td>{props.HomeLocation.longitude.toFixed(7)}</td>
                    <td>{props.HomeLocation.altitude.toFixed(0)}</td>
                    <td><input type="number" value={props.defaultAgl} onChange={e => props.setDefaultAgl(parseInt(e.target.value))}/> m</td>
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
                        props.CommandList.map((data, index) => {
                                return (
                                    <tr
                                        key={index}
                                        className={(index === props.wayPointCurrent?.index ? 'select-red' : '') + (props.selectedWaypointIndices.indexOf(index) >= 0 ? ' select-grey' : '')}
                                        onClick={() => {
                                            props.onWaypointClick(index)
                                        }}>
                                        <td>{(index + 1)}</td>
                                        <td>{data.command}</td>
                                        <td>{data.latitude.toFixed(7)}</td>
                                        <td>{data.longitude.toFixed(7)}</td>
                                        <td>{data.altitude.toFixed(0)} m</td>
                                        <td>{data.agl} m</td>
                                        <td>
                                            <ButtonGroup aria-label="Basic example" size="sm">
                                                <Button style={{fontSize: "10px"}} variant="dark" onClick={() => {
                                                    props.WaypointEditAction(data);
                                                }}>
                                                    <i className="fa fa-pencil-alt"></i>
                                                </Button>
                                                <Button style={{fontSize: "10px"}} variant="secondary"
                                                        onClick={() => {
                                                            props.jumpToWaypoint(index)
                                                        }}>jump</Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default WaypointsTab;
