import React, {useState, useEffect} from 'react';
import {Table, Button, ButtonGroup} from 'react-bootstrap'
import {missionDataType} from '../../viewModels/missionTypes';
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";


type WaypointsTabProps = {
    missionWaypoints: missionDataType;
    jumpToWaypoint: (index: number) => void;
    defaultAgl: number;
    setDefaultAgl: (val: number) => void;
    currentMissionIndex: number;
    selectedWaypointIndices: number[];
    WaypointEditAction: any;
    onWaypointClick: (index: number) => void;
    clearWaypoints: any;
    isDraft: boolean,
    setIndexWaypoints: (val: number) => void;
    isMissionEditable: boolean,
}

function WaypointsTab(props: WaypointsTabProps) {
    const [waypointsTabData, setWaypointsData] = useState<missionDataType | null>(null);

    useEffect(() => {
        setWaypointsData(props.missionWaypoints);
    }, [props.missionWaypoints])

    const handleDragEnd = (e: any) => {
        props.setIndexWaypoints(e);
    }
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
                    <td>{waypointsTabData?.home?.latitude.toFixed(7)}</td>
                    <td>{waypointsTabData?.home?.longitude.toFixed(7)}</td>
                    <td>{waypointsTabData?.home?.altitude.toFixed(0)}</td>
                    <td><input
                        disabled={props.isMissionEditable === false}
                        type="number"
                        value={props.defaultAgl}
                        onChange={e => props.setDefaultAgl(parseInt(e.target.value))}/> m
                    </td>
                    <td>
                        <Button
                            style={{fontSize: "10px"}}
                            variant="secondary"
                            size="sm"
                            disabled={props.isMissionEditable === false}
                            onClick={() => {
                                props.clearWaypoints()
                            }}>
                            <i className="fa fa-trash"></i> Clear
                        </Button>
                    </td>
                </tr>
                </tbody>
            </Table>
            <div style={{height: '260px', overflow: 'scroll'}}>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th style={{display: (props.isMissionEditable === false ? "none" : '')}}></th>
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
                        <Droppable droppableId="droppable-1">
                            {(provider) => (
                                <tbody
                                    className="text-capitalize"
                                    ref={provider.innerRef}
                                    {...provider.droppableProps}
                                >
                                {// @ts-ignore
                                    waypointsTabData?.waypoints?.map((data, indexs) => {
                                        return (
                                            <Draggable
                                                key={indexs}
                                                draggableId={(data.command + '-' + indexs)}
                                                index={indexs}
                                            >
                                                {(provider) => (
                                                    <tr
                                                        {...provider.draggableProps} ref={provider.innerRef}
                                                        key={indexs}
                                                        className={(indexs === props.currentMissionIndex ? 'select-red' : '' ? 'select-red' : '') + (props.selectedWaypointIndices.indexOf(indexs) >= 0 ? ' select-grey' : '')}
                                                        onClick={(e) => {
                                                            if (e.defaultPrevented === false) {
                                                                props.onWaypointClick(indexs)
                                                            }
                                                        }}>
                                                        <td style={{display: (props.isMissionEditable === false ? "none" : '')}} {...provider.dragHandleProps}> =</td>
                                                        <td>{(indexs + 1)}</td>
                                                        <td>{data.command}</td>
                                                        <td>{data.latitude?.toFixed(7)}</td>
                                                        <td>{data.longitude?.toFixed(7)}</td>
                                                        <td style={{width: "100px"}}>{data.altitude?.toFixed(0)} m</td>
                                                        <td>{data.agl} m</td>
                                                        <td>{data.parameter?.toString()}</td>
                                                        <td>
                                                            <ButtonGroup size="sm">
                                                                <Button style={{fontSize: "10px"}}
                                                                        disabled={props.isMissionEditable === false}
                                                                        variant="dark"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            props.WaypointEditAction({detail: data});
                                                                        }}>
                                                                    <i className="fa fa-pencil-alt"></i>
                                                                </Button>
                                                                <Button style={{fontSize: "10px"}}
                                                                        variant="warning"
                                                                        disabled={props.isDraft === false && props.isMissionEditable === false}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            props.jumpToWaypoint(indexs)
                                                                        }}>jump</Button>
                                                            </ButtonGroup>
                                                        </td>
                                                    </tr>
                                                )}

                                            </Draggable>
                                        );
                                    })
                                }
                                </tbody>
                            )}
                        </Droppable>
                    </Table>
                </DragDropContext>
            </div>
        </div>
    );
}

export default WaypointsTab;
