import { AircraftModel } from "../models/managerModels/aircraftModel";

export default class AircraftFleet {
    constructor(userCode: string){
        this.userCode = userCode;
        this.aircrafts = [];
    }

    userCode: string;
    private aircrafts: AircraftModel[];

    any = (certificateName: string) => {
        const list = this.aircrafts.filter(x => x.aircraftCertificateName === certificateName);
        return list.length > 0;
    }
    getListOfObservingAircraftCertificateNames = () => {
        return this.aircrafts.filter(x=> x.isObservingButNotControlling()).map(x=> x.aircraftCertificateName);
    }

    getListOfControllingAircraftCertificateNames = () => {
        return this.aircrafts.filter(x=> x.isControlling()).map(x=> x.aircraftCertificateName);
    }

    insert = (certificateName: string) => {
        if(this.any(certificateName))
            return false;
        
        const aircraft = new AircraftModel(certificateName, this.userCode);
        this.aircrafts.push(aircraft);

        return true;
    }

    remove = (certificateName: string) => {
        if(!this.any(certificateName))
            return false;
        
        this.aircrafts = this.aircrafts.filter(y=> y.aircraftCertificateName !== certificateName);
        return true;
    }

    getAircraftByCertificateName = (certificateName: string) => {
        const aircraft = this.aircrafts.filter(x => x.aircraftCertificateName === certificateName)[0];
        if(aircraft === undefined)
            return null;

        return aircraft;
    }
}
