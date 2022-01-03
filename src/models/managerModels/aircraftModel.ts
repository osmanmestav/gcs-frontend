import { PubSub } from "aws-amplify";
import { AircraftIdentifier, PilotageState } from "../aircraftModels/aircraft";
import { UserCredentials } from "../userModels/userCredentials";

export type processingFunctions = {
    processTelemetry: (data: any) => void;
    processStatus: (data: any) => void;
    processMission: (data: any) => void;
    processParameters: (data: any) => void;
};

export class AircraftModel {
    constructor(identifier: AircraftIdentifier, user: UserCredentials){
        this.userCredentials = user;
        this.aircraftIdentifier = identifier;
        this.pilotageStatus = PilotageState.None;
    }
    userCredentials: UserCredentials;
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
        if(!this.userCredentials.isPilot)
            return;
        let requestId = 0;
        if (this.aircraftIdentifier.aircraftCertificateName === e.detail.aircraftCertificateName) {
            requestId++;
            e.detail.requestId = requestId;
            PubSub.publish(this.userCredentials.getCommandPublisherTopicString(this.aircraftIdentifier.aircraftCertificateName), e.detail);
        }
    }

    requestClaim = () => {
        this.commandPublisher(
            {
                detail: { 
                    requestId: 1,
                    userCode: this.userCredentials.userCode,
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
        this.telemetrySubscription = PubSub.subscribe(this.userCredentials.getAircraftTelemetryTopicString(this.aircraftIdentifier.aircraftCertificateName)).subscribe({
            next: data => {
                if(this.isObserving())
                    next.processTelemetry(data);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        this.missionSubscription = PubSub.subscribe(this.userCredentials.getAircraftMissionTopicString(this.aircraftIdentifier.aircraftCertificateName)).subscribe({
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
        this.parametersSubscription = PubSub.subscribe(this.userCredentials.getAircraftParametersTopicString(this.aircraftIdentifier.aircraftCertificateName)).subscribe({
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