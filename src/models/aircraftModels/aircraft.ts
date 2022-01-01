export type AircraftIdentifier = {
    aircraftId: number,
    aircraftName: string, 
    aircraftCertificateName: string
};

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