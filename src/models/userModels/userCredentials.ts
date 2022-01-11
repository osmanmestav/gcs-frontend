export class UserCredentials {
    constructor(tenantCode: string, userCode: string, isPilot: boolean){
        this.tenantCode = tenantCode;
        this.userCode = userCode;
        this.isPilot = isPilot;
    }
    userCode: string;
    tenantCode: string; 
    isPilot: boolean;

    getUserStatusTopicString = () => {
        return this.tenantCode + '/G/' + this.userCode + '/S';
    }

    getAircraftStatusesTopicString = () => {
        return this.tenantCode + '/U/+/S';
    }
    getControlStationStatusesTopicString = () => {
        return this.tenantCode + '/G/+/S';
    }

    getSimulateTelemetryTopicString = (certificateName: string) => {
        return this.tenantCode + '/U/'  + certificateName + '/T';
    }

    getCommandPublisherTopicString = (certificateName: string) => {
        return this.tenantCode + '/G/' + this.userCode + '/' + certificateName + '/C';
    }

    getAircraftResponseTopicString = (certificateName: string) => {
        return this.tenantCode + '/U/' + certificateName + '/' + this.userCode + '/R';
    }

    getAircraftTelemetryTopicString = (certificateName: string) => {
        return this.tenantCode + '/U/' + certificateName + '/T';
    }

    getAircraftMissionTopicString = (certificateName: string) => {
        return this.tenantCode + '/U/' + certificateName + '/M';
    }

    getAircraftParametersTopicString = (certificateName: string) => {
        return this.tenantCode + '/U/' + certificateName + '/P';
    }
}