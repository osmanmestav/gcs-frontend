export type GCSControllerModel = {
    userCode: string,
    userName: string
}

export class AircraftStatusTopicMessage {
    aircraftName: string = '';
    aircraftCertificateName: string = '';
    aircraftId: number = 0;
    gcsController: GCSControllerModel = {userCode: '', userName: ''};
};