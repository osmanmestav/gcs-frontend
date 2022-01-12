import { AircraftIdentifier, AircraftState, PilotageState } from "../models/aircraftModels/aircraft";
import { publishSummaryLog, SummaryLogType } from "../models/helperModels/summaryLog";
import { TelemetrySummaryModel } from "../models/telemetryModels/telemetryModels";
import { UserCredentials } from "../models/userModels/userCredentials";
import { getEnumValueByEnumKey } from "../utils/enumHelpers";
import { publishEvent, PubSubEvent } from "../utils/PubSubService";
import AircraftFleet from "./aircraftFleet";

export default class FlightData {
    constructor(user: UserCredentials, maps: any){
        this.userCredentials = user;
        this.aircraftFleet = new AircraftFleet(user);
        this.telemetryMessages = {};
        this.telemetrySummaries = [];
        this.activeAircraft = null;
        this.mapsWindow = maps;
        this.registerWindowCSharpEvents();
    }

    mapsWindow: any;
    userCredentials: UserCredentials;
    aircraftFleet: AircraftFleet;
    activeAircraft: AircraftState | null;

    getcsharp = () => {
        return this.mapsWindow && this.mapsWindow.csharp;
    }

    refreshAircraftPilotageState = () => {
        this.getcsharp().isMissionEditable = this.activeAircraft?.isControlling ?? false;
        publishEvent(PubSubEvent.ActiveAircraftPilotageStateChanged);
    }

    activeAircraftChanged = (input: any) => {
        const aircraftId : number = input.detail;
        const aircraft = this.aircraftFleet.getAircraftById(aircraftId);
        if(aircraft !== null){
            const isControlling = aircraft.isControlling();
            this.activeAircraft = new AircraftState(aircraft.aircraftIdentifier, isControlling);
            this.refreshAircraftPilotageState();
            let csharp = this.getcsharp();
            setTimeout(() => {
                if (csharp && csharp.selectedAircraft && aircraft.aircraftMission.aircraftName === csharp.selectedAircraft.aircraftName) {
                    csharp.receivedMission(aircraft.aircraftMission, 'mission-download');
                }
            }, 500);
        }
    };

    checkActiveAircraftPilotageState = (aircraft: AircraftIdentifier, state: PilotageState) => {
        if(this.activeAircraft != null && this.activeAircraft.aircraftId === aircraft.aircraftId) {
            this.activeAircraft.isControlling = (state === PilotageState.Controlling);
            this.refreshAircraftPilotageState();
        }
    }

    isActiveAircraftBeingControlled = () => {
        return this.activeAircraft?.isControlling ?? false;
    }

    insertSummaryLog = (input: any) => {
        publishSummaryLog(input.detail.msg, getEnumValueByEnumKey(SummaryLogType, input.detail.category) as SummaryLogType);
    }

    registerWindowCSharpEvents = () => {
        this.mapsWindow.addEventListener("AircraftSelectionChanged_FlightData", this.activeAircraftChanged);
        this.mapsWindow.addEventListener("FlightSummaryAdd", this.insertSummaryLog);
    }


    // -----------------------------------------------------------------
    // the below will be used for later

    /**
     * an object with keys as aircraftId.
     */
    telemetryMessages: { [key: number]: any };
    telemetrySummaries: TelemetrySummaryModel[];
    

    prepareTelemetrySummary = (telMsg: any) => {
        return {
            aircraftId: telMsg.aircraftId,
            altitude: telMsg.altitude,
            latitude: telMsg.latitude,
            longitude: telMsg.longitude,
            isSittingOnGround: telMsg.travelStatus === 0,
        } as TelemetrySummaryModel;
    };

    // addAircraft in csharp
    initiateNewFlightTelemetry = (telMsg: any) => {
        let aircraftId = telMsg.aircraftId;
        this.telemetryMessages[aircraftId] = telMsg;
        this.telemetrySummaries[aircraftId] = Object.assign({}, this.prepareTelemetrySummary(telMsg));
        window.dispatchEvent(new CustomEvent('AircraftAdded', {detail: aircraftId}));
        if(this.activeAircraft === null){
            this.activateAircraft( {
                aircraftId: telMsg.aircraftId,
                aircraftName: telMsg.aircraftName,
                aircraftCertificateName: telMsg.aircraftCertificateName,
            });
        }
    } 
    // updateAircraft in csharp
    insertTelemetryMessage = (telMsg: any) => {
        if(!this.aircraftFleet.any(telMsg.aircraftCertificateName))
            return;
        try {
            let aircraft = this.telemetryMessages[telMsg.aircraftId];
            if (!aircraft) {
                this.initiateNewFlightTelemetry(telMsg);
                aircraft = this.telemetryMessages[telMsg.aircraftId];
            }
            this.telemetrySummaries[telMsg.aircraftId] = Object.assign({}, this.prepareTelemetrySummary(telMsg));
            Object.assign(aircraft, telMsg);
            window.dispatchEvent(new CustomEvent('AircraftChanged', {detail: aircraft}));
        } catch (err) {
            console.log(err);
        }
    }
    // selectAircraft in csharp
    activateAircraft = (aircraftIdentifier: AircraftIdentifier) => {
        const aircraft = this.aircraftFleet.getAircraftByCertificateName(aircraftIdentifier.aircraftCertificateName);
        if(aircraft !== null){
            this.activeAircraft = new AircraftState(aircraftIdentifier, aircraft.isControlling());
            window.dispatchEvent(new CustomEvent('AircraftSelectionChanged', {detail: aircraftIdentifier.aircraftId}));
        }
    }
} 