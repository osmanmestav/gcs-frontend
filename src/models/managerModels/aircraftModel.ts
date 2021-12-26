import { PubSub } from "aws-amplify";
import { defaultUserCode } from "../../managers/mqttManager";

export type processingFunctions = {
    processTelemetry: (data: any) => void;
    processStatus: (data: any) => void;
    processMission: (data: any) => void;
    processParameters: (data: any) => void;
};

enum AircraftPilotageStatus {
    None,
    Initiated, 
    ProcessingTelemetry,
    Controlling
} 

export class AircraftModel {
    constructor(name: string){
        this.aircraftCertificateName = name;
        this.pilotageStatus = AircraftPilotageStatus.None;
    }
    aircraftCertificateName: string;
    private telemetrySubscription: any;
    private missionSubscription: any;
    private parametersSubscription: any;

    aircraftMission: any;
    aircraftParameters: any;

    pilotageStatus: AircraftPilotageStatus;

    receivedMission = ( mission: any) => {
        if(this.pilotageStatus === AircraftPilotageStatus.None){
            if(!this.aircraftMission && this.aircraftParameters){
                this.pilotageStatus = AircraftPilotageStatus.ProcessingTelemetry;
            }
        }
        this.aircraftMission = mission;
    }

    receivedParameters = ( parameters: any) => {
        if(this.pilotageStatus === AircraftPilotageStatus.None){
            if(!this.aircraftParameters && this.aircraftMission){
                this.pilotageStatus = AircraftPilotageStatus.ProcessingTelemetry;
            }
        }
        this.aircraftParameters = parameters;
    }

    isObserving = () => {
        return this.pilotageStatus === AircraftPilotageStatus.ProcessingTelemetry || this.pilotageStatus === AircraftPilotageStatus.Controlling;
    }

    isObservingButNotControlling = () => {
        return this.pilotageStatus === AircraftPilotageStatus.ProcessingTelemetry;
    }

    isControlling = () => {
        return this.pilotageStatus === AircraftPilotageStatus.Controlling;
    }

    commandPublisher = (e: any) => {
        let requestId = 0;
        if (this.aircraftCertificateName === e.detail.aircraftCertificateName) {
            requestId++;
            e.detail.requestId = requestId;
            PubSub.publish('UL/G/' + defaultUserCode+ '/' + this.aircraftCertificateName + '/C', e.detail);
        }
    }

    startObserving = (next: processingFunctions) => {
        this.telemetrySubscription = PubSub.subscribe('UL/U/' + this.aircraftCertificateName + '/T').subscribe({
            next: data => {
                if(this.isObserving())
                    next.processTelemetry(data);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        this.missionSubscription = PubSub.subscribe('UL/U/' + this.aircraftCertificateName + '/M').subscribe({
            next: data => {
                console.log('Mission received', data.value);
                this.receivedMission(data.value);
                next.processMission(data);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        this.parametersSubscription = PubSub.subscribe('UL/U/' + this.aircraftCertificateName + '/P').subscribe({
            next: data => {
                console.log('Parameters received', data.value);
                this.receivedParameters(data.value);
                next.processParameters(data);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        this.commandPublisher(
            {
                detail: { 
                    requestId: 1,
	                userCode: defaultUserCode,
                    aircraftCertificateName: this.aircraftCertificateName,
	                aircraftName: this.aircraftCertificateName,
	                aircraftId: 11,
                    command: 'Claim',
                    data: {}
                }
            }
        );
        // temporary set for full control.
        this.pilotageStatus = AircraftPilotageStatus.Controlling;
    }

    unregister(){
        this.telemetrySubscription?.unsubscribe();
        this.missionSubscription?.unsubscribe();
        this.parametersSubscription?.unsubscribe();
    };
}