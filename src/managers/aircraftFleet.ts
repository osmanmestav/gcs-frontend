import { AircraftIdentifier } from "../models/aircraftModels/aircraft";
import { AircraftModel } from "../models/managerModels/aircraftModel";
import { UserCredentials } from "../models/userModels/userCredentials";

export default class AircraftFleet {
    constructor(user: UserCredentials){
        this.userCredentials = user;
        this.aircrafts = [];
    }

    userCredentials: UserCredentials;
    private aircrafts: AircraftModel[];

    any = (certificateName: string) => {
        const list = this.aircrafts.filter(x => x.aircraftIdentifier.aircraftCertificateName === certificateName);
        return list.length > 0;
    }



    getListOfObservingAircrafts = () => {
        return this.aircrafts.filter(x=> x.isObservingButNotControlling()).map(x=> x.aircraftIdentifier);
    }

    getListOfControllingAircrafts = () => {
        return this.aircrafts.filter(x=> x.isControlling()).map(x=> x.aircraftIdentifier);
    }

    insert = (identfier: AircraftIdentifier) => {
        if(this.any(identfier.aircraftCertificateName))
            return false;
        
        const aircraft = new AircraftModel(identfier, this.userCredentials);
        this.aircrafts.push(aircraft);

        return true;
    }

    remove = (certificateName: string) => {
        if(!this.any(certificateName))
            return false;
        
        this.aircrafts = this.aircrafts.filter(y=> y.aircraftIdentifier.aircraftCertificateName !== certificateName);
        return true;
    }

    getAircraftByCertificateName = (certificateName: string) => {
        const aircraft = this.aircrafts.filter(x => x.aircraftIdentifier.aircraftCertificateName === certificateName)[0];
        if(aircraft === undefined)
            return null;

        return aircraft;
    }

    getAircraftById = (id: number) => {
        const aircraft = this.aircrafts.filter(x => x.aircraftIdentifier.aircraftId === id)[0];
        if(aircraft === undefined)
            return null;

        return aircraft;
    }
}
