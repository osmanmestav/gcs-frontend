import { PubSub } from "aws-amplify";
import { AircraftIdentifier, PilotageState } from "../aircraftModels/aircraft";
import { publishSummaryLog, SummaryLogType } from "../helperModels/summaryLog";
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
        this.requestId = 0;
    }
    userCredentials: UserCredentials;
    aircraftIdentifier: AircraftIdentifier;
    private telemetrySubscription: any;
    private missionSubscription: any;
    private parametersSubscription: any;
    private responseSubscription: any;

    aircraftMission: any;
    aircraftParameters: any;

    pilotageStatus: PilotageState;

    requestId: number;

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
        
        if (this.aircraftIdentifier.aircraftCertificateName === e.detail.aircraftCertificateName) {
            this.requestId++;
            e.detail.requestId = this.requestId;
            PubSub.publish(this.userCredentials.getCommandPublisherTopicString(this.aircraftIdentifier.aircraftCertificateName), e.detail);
        }
    }

    requestClaim = () => {
        if(!this.userCredentials.isPilot)
            return;

        this.responseSubscription = PubSub.subscribe(this.userCredentials.getAircraftResponseTopicString(this.aircraftIdentifier.aircraftCertificateName)).subscribe({
            next: data => {
                if(this.isControlling() && data.value.aircraftCertificateName === this.aircraftIdentifier.aircraftCertificateName) {
                    publishSummaryLog("Command response received for request id #" + data.value.requestID + ", command: " + data.value.command, SummaryLogType.Message, this.aircraftIdentifier.aircraftName);
                }
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });    
        this.requestId = 0;
        this.commandPublisher(
            {
                detail: { 
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
                // console.log('Mission received', data.value);
                publishSummaryLog("Mission received", SummaryLogType.Message, this.aircraftIdentifier.aircraftName);
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
                // console.log('Parameters received', data.value);
                publishSummaryLog("Parameters received", SummaryLogType.Message, this.aircraftIdentifier.aircraftName);
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
        this.responseSubscription?.unsubscribe();
    };
}