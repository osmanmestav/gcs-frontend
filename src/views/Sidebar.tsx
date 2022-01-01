import React, {useEffect, useState} from 'react';
import SidebarTabs from "./components/SidebarTabs";
import Console from "./components/Console"
import Control from "./components/Control"
import AircraftsListModal from './components/AircraftsManagement/AircraftsListModal';
import {publishEvent, PubSubEvent} from '../utils/PubSubService';
import FlightData from '../managers/flightData';
import { AircraftPilotageStatus, PilotageState } from '../models/aircraftModels/aircraft';


type SidebarProps = {
    mapsWindow: any;
    openGauges: () => void;
    flightData: FlightData;
    startTelemetrySimulation: () => void;
    subscribeToAircraftStatuses: (initiate: boolean) => void;
    subscribeToUserStatuses: (initiate: boolean) => void;
};

function Sidebar(props: SidebarProps) {
    const [showAircraftsListModal, setShowAircraftsListModal] = useState<boolean>(false);
    const [isMissionEditable, setIsMissionEditable] = useState<boolean>(props.mapsWindow.csharp.isMissionEditable);

    const manageAircrafts = () => {
        if (showAircraftsListModal)
            return;
        setShowAircraftsListModal(true);
        props.subscribeToAircraftStatuses(true);
        props.subscribeToUserStatuses(true);
    }

    const onAircraftsManagementModalClosed = (isCancelled: boolean, aircraftNames: AircraftPilotageStatus[]) => {
        setShowAircraftsListModal(false);
        props.subscribeToAircraftStatuses(false);
        props.subscribeToUserStatuses(false);
        if (!isCancelled && aircraftNames.length > 0) {
            publishEvent(PubSubEvent.ManageAircraftsEvent, ...aircraftNames)
        }
    }

    useEffect(() => {
        props.mapsWindow.addEventListener("ManageAircrafts", manageAircrafts);
        return () => {
            props.mapsWindow.removeEventListener("ManageAircrafts", manageAircrafts);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.mapsWindow]);


    const getAircraftStates = () => {
        const controllingList = props.flightData.aircraftFleet.getListOfControllingAircrafts().map(x => new AircraftPilotageStatus(x, PilotageState.Controlling));
        const observingList = props.flightData.aircraftFleet.getListOfObservingAircrafts().map(x => new AircraftPilotageStatus(x, PilotageState.Observing));
        return controllingList.concat(...observingList);
    }

    return (
        <div>
            <Control
                isMissionEditable={isMissionEditable}
                openGauges={props.openGauges}
                startTelemetrySimulation={props.startTelemetrySimulation}
                mapWindow={props.mapsWindow}>
            </Control>
            <SidebarTabs isMissionEditable={isMissionEditable} mapWindow={props.mapsWindow}></SidebarTabs>
            <Console mapWindow={props.mapsWindow}></Console>
            {
                showAircraftsListModal &&
                <AircraftsListModal
                    show={showAircraftsListModal}
                    userCode={props.flightData.userCode}
                    aircraftStates={getAircraftStates()}
                    onCloseModal={onAircraftsManagementModalClosed}/>
            }
        </div>
    );
}

export default Sidebar;
