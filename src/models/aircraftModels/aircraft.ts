export type AircraftIdentifier  = {
    aircraftId: number,
    aircraftName: string, 
    aircraftCertificateName: string
};

export class AircraftState {
    constructor(identifier: AircraftIdentifier, isControlling: boolean = false){
        this.aircraftId = identifier.aircraftId;
        this.aircraftName = identifier.aircraftName;
        this.aircraftCertificateName = identifier.aircraftCertificateName;
        this.isControlling = isControlling;
    }
    aircraftId: number;
    aircraftName: string; 
    aircraftCertificateName: string;
    isControlling: boolean;
}

export enum PilotageState {
    None,
    Observing,
    Controlling
}

export class AircraftPilotageStatus {
    constructor(identifier: AircraftIdentifier, state: PilotageState) {
        this.aircraftIdentifier = identifier;
        this.state = state;
    };

    aircraftIdentifier: AircraftIdentifier;
    state: PilotageState;

    isObserving = () => {
        return (this.state === PilotageState.Observing || this.state === PilotageState.Controlling);
    };

    isControlling = () => {
        return this.state === PilotageState.Controlling;
    };
};