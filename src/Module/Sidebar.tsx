import React from 'react';
import SidebarTabs from "./Component/SidebarTabs";
import Console from "./Component/Console"
import Control from "./Component/Control"


function Sidebar(props: any) {
    return (
        <div>
            <Control openGauges={props.openGauges} 
                    startTelemetrySimulation={props.startTelemetrySimulation}
                    mapWindow={props.mapWindow}>
            </Control>
            <SidebarTabs mapWindow={props.mapWindow}></SidebarTabs>
            <Console mapWindow={props.mapWindow}></Console>
        </div>
    );
}

export default Sidebar;
