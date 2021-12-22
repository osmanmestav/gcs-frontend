import React, { useEffect, useState } from 'react';
import SidebarTabs from "./Component/SidebarTabs";
import Console from "./Component/Console"
import Control from "./Component/Control"
import AircraftsListModal from './Component/AircraftsManagement/AircraftsListModal';
import { publishEvent, PubSubEvent } from '../utils/PubSubService';


type SidebarProps = {
    mapsWindow: any;
    openGauges: () => void;
    startTelemetrySimulation: () => void;
    subscribeToAircraftStatuses: (initiate: boolean) => void;
    subscribeToUserStatuses: (initiate: boolean) => void;
};

function Sidebar(props: SidebarProps) {
    const [showAircraftsListModal, setShowAircraftsListModal ] = useState<boolean>(false);

    const manageAircrafts = () => {
        if(showAircraftsListModal )
            return;
        setShowAircraftsListModal(true);    
        props.subscribeToAircraftStatuses(true);
        props.subscribeToUserStatuses(true);
    }
    
    const onAircraftsManagementModalClosed = (isCancelled: boolean, aircraftNames: string[]) => {
        setShowAircraftsListModal(false);    
        props.subscribeToAircraftStatuses(false);
        props.subscribeToUserStatuses(false);
        if(!isCancelled && aircraftNames.length > 0){
            publishEvent(PubSubEvent.ManageAircrafts, ...aircraftNames)
        }
    }

    useEffect(() => {
        props.mapsWindow.addEventListener("ManageAircrafts", manageAircrafts);
        return () => {
            props.mapsWindow.removeEventListener("ManageAircrafts", manageAircrafts);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.mapsWindow]);

    return (
        <div>
            <Control openGauges={props.openGauges} 
                    startTelemetrySimulation={props.startTelemetrySimulation}
                    mapWindow={props.mapsWindow}>
            </Control>
            <SidebarTabs mapWindow={props.mapsWindow}></SidebarTabs>
            <Console mapWindow={props.mapsWindow}></Console>
            {
                showAircraftsListModal && 
                <AircraftsListModal show={showAircraftsListModal} onCloseModal={onAircraftsManagementModalClosed}/>
            }
        </div>
    );
}

export default Sidebar;
