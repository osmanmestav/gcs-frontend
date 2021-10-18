import React, {useState, useEffect} from 'react';
import WaypointsTable from "./Component/Waypoints-table";
import Console from "./Component/Console"
import Control from "./Component/Control"
import {
    Row,
} from 'react-bootstrap'

function Sidebar() {
    return (
        <Row>
            <Control></Control>
            <WaypointsTable></WaypointsTable>
            <Console></Console>
        </Row>
    );
}

export default Sidebar;
