import React, {useEffect, useState} from 'react';
import SidebarTabs from "./components/SidebarTabs";
import Console from "./components/Console"
import Control from "./components/Control"
import AircraftsListModal from './components/AircraftsManagement/AircraftsListModal';
import {publishEvent, PubSubEvent, removeEvent, subscribeEvent} from '../utils/PubSubService';
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
    const [isActiveAircraftBeingControlled, setIsActiveAircraftBeingControlled] = useState<boolean>(props.flightData.isActiveAircraftBeingControlled());

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
            publishEvent(PubSubEvent.ManageAircraftsEvent, ...aircraftNames);
        }
    }

    const activeAircraftPilotageStateChanged = () => {
        const isControlling = props.flightData.isActiveAircraftBeingControlled();
        setIsActiveAircraftBeingControlled(isControlling);
    }

    useEffect(() => {
        props.mapsWindow.addEventListener("ManageAircrafts", manageAircrafts);
        subscribeEvent(PubSubEvent.ActiveAircraftPilotageStateChanged, activeAircraftPilotageStateChanged);
        return () => {
            props.mapsWindow.removeEventListener("ManageAircrafts", manageAircrafts);
            removeEvent(PubSubEvent.ActiveAircraftPilotageStateChanged, activeAircraftPilotageStateChanged);
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
            (Tenant Code: {props.flightData.userCredentials.tenantCode}; User Code: {props.flightData.userCredentials.userCode}; Role: {props.flightData.userCredentials.isPilot ? "Pilot" : "Observer"})
            <Control
                isMissionEditable={isActiveAircraftBeingControlled}
                openGauges={props.openGauges}
                startTelemetrySimulation={props.startTelemetrySimulation}
                mapWindow={props.mapsWindow}>
            </Control>
            <SidebarTabs 
                style={{height: '350px', minHeight: '350px', backgroundColor: '#000', padding: '10px', overflow: 'scroll'}}
                isMissionEditable={isActiveAircraftBeingControlled} mapWindow={props.mapsWindow}></SidebarTabs>
            <Console/>
            {
                showAircraftsListModal &&
                <AircraftsListModal
                    show={showAircraftsListModal}
                    user={props.flightData.userCredentials}
                    aircraftStates={getAircraftStates()}
                    onCloseModal={onAircraftsManagementModalClosed}/>
            }
        </div>
    );
}

export default Sidebar;
