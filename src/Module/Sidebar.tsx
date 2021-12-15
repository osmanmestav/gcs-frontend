import React, { useEffect, useState } from 'react';
import SidebarTabs from "./Component/SidebarTabs";
import Console from "./Component/Console"
import Control from "./Component/Control"
import AircraftsListModal from './Component/AircraftsManagement/AircraftsListModal';


type SidebarProps = {
    mapsWindow: any;
    openGauges: () => void;
    startTelemetrySimulation: () => void;
    manageAircrafts: (initiate: boolean) => void;
};

function Sidebar(props: SidebarProps) {
    const [showAircraftsListModal, setShowAircraftsListModal ] = useState<boolean>(false);

    const manageAircrafts = () => {
        if(showAircraftsListModal )
            return;
        setShowAircraftsListModal(true);    
        props.manageAircrafts(true);
    }
    
    const onAircraftsListModalClosed = (isCancelled: boolean) => {
        setShowAircraftsListModal(false);    
        props.manageAircrafts(false);
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
                <AircraftsListModal show={showAircraftsListModal} onCloseModal={onAircraftsListModalClosed}/>
            }
        </div>
    );
}

export default Sidebar;
