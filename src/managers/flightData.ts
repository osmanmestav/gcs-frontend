import AircraftFleet from "./aircraftFleet";

export default class FlightData {
    constructor(){
        this.aircraftFleet = new AircraftFleet();
    }

    aircraftFleet: AircraftFleet;
} 