import { AircraftIdentifier, TelemetrySummaryModel } from "../models/telemetryModels/telemetryModels";
import AircraftFleet from "./aircraftFleet";

export default class FlightData {
    constructor(userCode: string){
        this.userCode = userCode;
        this.aircraftFleet = new AircraftFleet(userCode);
        this.telemetryMessages = {};
        this.telemetrySummaries = [];
        this.activeAircraft = null;
    }
    userCode: string;
    aircraftFleet: AircraftFleet;
    /**
     * an object with keys as aircraftId.
     */
    telemetryMessages: { [key: number]: any };
    telemetrySummaries: TelemetrySummaryModel[];
    activeAircraft: AircraftIdentifier | null;

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
        this.activeAircraft = aircraftIdentifier;
        window.dispatchEvent(new CustomEvent('AircraftSelectionChanged', {detail: aircraftIdentifier.aircraftId}));
    }
} 