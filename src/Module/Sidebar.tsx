import React from 'react';
// @ts-ignore
import SidebarTabs from "./Component/SidebarTabs";
// @ts-ignore
import _Old_WaypointsTable from "./Component/Waypoints-table.tsx";
// @ts-ignore
import Console from "./Component/Console.tsx"
// @ts-ignore
import Control from "./Component/Control.tsx"

import {
    Row,
} from 'react-bootstrap'

function Sidebar(props: any) {
    return (
        <Row>
            <Control openGauges={props.openGauges} startTelemetrySimulation={props.startTelemetrySimulation}
                     mapWindow={props.mapWindow}></Control>
            <SidebarTabs mapWindow={props.mapWindow}></SidebarTabs>
            <Console mapWindow={props.mapWindow}></Console>
        </Row>
    );
}

export default Sidebar;
