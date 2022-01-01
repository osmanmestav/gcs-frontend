import { PubSub } from "aws-amplify";
import { AircraftIdentifier, PilotageState } from "../aircraftModels/aircraft";

export type processingFunctions = {
    processTelemetry: (data: any) => void;
    processStatus: (data: any) => void;
    processMission: (data: any) => void;
    processParameters: (data: any) => void;
};

export class AircraftModel {
    constructor(identifier: AircraftIdentifier, userCode: string){
        this.userCode = userCode;
        this.aircraftIdentifier = identifier;
        this.pilotageStatus = PilotageState.None;
    }
    userCode: string;
    aircraftIdentifier: AircraftIdentifier;
    private telemetrySubscription: any;
    private missionSubscription: any;
    private parametersSubscription: any;

    aircraftMission: any;
    aircraftParameters: any;

    pilotageStatus: PilotageState;

    receivedMission = ( mission: any) => {
        if(this.pilotageStatus === PilotageState.None){
            if(!this.aircraftMission && this.aircraftParameters){
                this.pilotageStatus = PilotageState.Observing;
            }
        }
        this.aircraftMission = mission;
    }

    receivedParameters = ( parameters: any) => {
        if(this.pilotageStatus === PilotageState.None){
            if(!this.aircraftParameters && this.aircraftMission){
                this.pilotageStatus = PilotageState.Observing;
            }
        }
        this.aircraftParameters = parameters;
    }

    isObserving = () => {
        return this.pilotageStatus === PilotageState.Observing || this.pilotageStatus === PilotageState.Controlling;
    }

    isObservingButNotControlling = () => {
        return this.pilotageStatus === PilotageState.Observing;
    }

    isControlling = () => {
        return this.pilotageStatus === PilotageState.Controlling;
    }

    commandPublisher = (e: any) => {
        let requestId = 0;
        if (this.aircraftIdentifier.aircraftCertificateName === e.detail.aircraftCertificateName) {
            requestId++;
            e.detail.requestId = requestId;
            PubSub.publish('UL/G/' + this.userCode + '/' + this.aircraftIdentifier.aircraftCertificateName + '/C', e.detail);
        }
    }

    requestClaim = () => {
        this.commandPublisher(
            {
                detail: { 
                    requestId: 1,
                    userCode: this.userCode,
                    aircraftCertificateName: this.aircraftIdentifier.aircraftCertificateName,
                    aircraftName: this.aircraftIdentifier.aircraftCertificateName,
                    aircraftId: this.aircraftIdentifier.aircraftId,
                    command: 'Claim',
                    data: {}
                }
            }
        );
        this.pilotageStatus = PilotageState.Controlling;
    }

    startObserving = (next: processingFunctions, requestClaim: boolean) => {
        this.telemetrySubscription = PubSub.subscribe('UL/U/' + this.aircraftIdentifier.aircraftCertificateName + '/T').subscribe({
            next: data => {
                if(this.isObserving())
                    next.processTelemetry(data);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        this.missionSubscription = PubSub.subscribe('UL/U/' + this.aircraftIdentifier.aircraftCertificateName + '/M').subscribe({
            next: data => {
                console.log('Mission received', data.value);
                this.receivedMission(data.value);
                setTimeout(() => {
                    next.processMission(data);
                }, 1000);
                
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        this.parametersSubscription = PubSub.subscribe('UL/U/' + this.aircraftIdentifier.aircraftCertificateName + '/P').subscribe({
            next: data => {
                console.log('Parameters received', data.value);
                this.receivedParameters(data.value);
                next.processParameters(data);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });

        if(requestClaim){
            this.requestClaim();
        }
    }

    unregister(){
        this.telemetrySubscription?.unsubscribe();
        this.missionSubscription?.unsubscribe();
        this.parametersSubscription?.unsubscribe();
    };
}