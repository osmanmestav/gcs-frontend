import React from 'react';
import WaypointsTable from "./Component/Waypoints-table";
import Console from "./Component/Console"
import Control from "./Component/Control"
import {
    Row,
} from 'react-bootstrap'

function Sidebar(props) {
    return (
        <Row>
            <Control openGauges={props.openGauges}></Control>
            <WaypointsTable mapWindow={props.mapWindow}></WaypointsTable>
            <Console></Console>
        </Row>
    );
}

export default Sidebar;
