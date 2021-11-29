import React from 'react';
import {Table, Button, ButtonGroup} from 'react-bootstrap'
import GeoLocationModel from '../../models/geoLocationModel';
import {missionDataType} from '../../models/missionTypes';


type WaypointsTabProps = {
    missionData: missionDataType;
    jumpToWaypoint: (index: number) => void;
    homeLocation: GeoLocationModel;
    defaultAgl: number;
    setDefaultAgl: (val: number) => void;
    currentMissionIndex: number;
    selectedWaypointIndices: number[];
    WaypointEditAction: any;
    onWaypointClick: (index: number) => void;
    clearWaypoints: any;
    isDraft: boolean;
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
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{(props.missionData as any).home?.latitude.toFixed(7)}</td>
                    <td>{(props.missionData as any).home?.longitude.toFixed(7)}</td>
                    <td>{(props.missionData as any).home?.altitude.toFixed(0)}</td>
                    <td><input type="number" value={props.defaultAgl}
                               onChange={e => props.setDefaultAgl(parseInt(e.target.value))}/> m
                    </td>
                    <td><Button style={{fontSize: "10px"}} variant="secondary" size="sm" onClick={() => {
                        props.clearWaypoints()
                    }}><i className="fa fa-trash"></i> Clear</Button></td>
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
                        <th>Parameter</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {// @ts-ignore
                        props.missionData.waypoints?.map((data, indexs) => {
                            return (
                                <tr
                                    key={indexs}
                                    className={(indexs == props.currentMissionIndex ? 'select-red' : '' ? 'select-red' : '') + (props.selectedWaypointIndices.indexOf(indexs) >= 0 ? ' select-grey' : '')}
                                    onClick={() => {
                                        props.onWaypointClick(indexs)
                                    }}>
                                    <td>{(indexs + 1)}</td>
                                    <td>{data.command}</td>
                                    <td>{data.latitude}</td>
                                    <td>{data.longitude}</td>
                                    <td style={{width: "100px"}}>{data.altitude.toFixed(0)} m</td>
                                    <td>{data.agl} m</td>
                                    <td>{data.parameter.toString()}</td>
                                    <td>
                                        <ButtonGroup aria-label="Basic example" size="sm">
                                            <Button style={{fontSize: "10px"}} variant="dark" onClick={() => {
                                                props.WaypointEditAction(data);
                                            }}>
                                                <i className="fa fa-pencil-alt"></i>
                                            </Button>
                                            <Button style={{fontSize: "10px"}} variant="warning"
                                                    disabled={(props.isDraft)} onClick={() => {
                                                props.jumpToWaypoint(indexs)
                                            }}>jump</Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default WaypointsTab;
