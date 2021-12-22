import "../login";
import Amplify from "@aws-amplify/core";
import PubSub, {AWSIoTProvider} from "@aws-amplify/pubsub";
import {preprocessTelemetry} from "../preprocessTelemetry";
import { publishEvent, PubSubEvent, removeEvent, subscribeEvent } from "../utils/PubSubService";
import { Auth } from "aws-amplify";


type processingFunctions = {
    processTelemetry: (data: any) => void;
    processStatus: (data: any) => void;
};

class AircraftModel {
    constructor(name: string){
        this.aircraftCertificateName = name;
    }
    aircraftCertificateName: string;
    telemetrySubscription: any;
    missionSubscription: any;

    aircraftMission: any;

    commandPublisher = (e: any) => {
        let requestId = 0;
        if (this.aircraftCertificateName === e.detail.aircraftCertificateName) {
            requestId++;
            e.detail.requestId = requestId;
            PubSub.publish('UL/G/pilot1/' + this.aircraftCertificateName + '/C', e.detail);
        }
    }

    startObserving = (next: processingFunctions) => {
        this.telemetrySubscription = PubSub.subscribe('UL/U/' + this.aircraftCertificateName + '/T').subscribe({
            next: next.processTelemetry,
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        this.missionSubscription = PubSub.subscribe('UL/U/' + this.aircraftCertificateName + '/M').subscribe({
            next: data => {
                console.log('Mission received', data.value);
                this.aircraftMission = data.value;
                next.processStatus(data);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
    }

    unregister(){
        this.telemetrySubscription?.unsubscribe();
        this.missionSubscription?.unsubscribe();
    };
}

export default class MQTTManager {
    constructor(maps: any) {
        this.mapsWindow = maps;
        this.gaugesWindow = null;
        this.aircrafts = [];
        this.isActive = false;
    };


    mapsWindow: any;
    gaugesWindow: any;
    aircrafts: AircraftModel[];
    isActive: boolean;

    awsIoTProviderOptions = {
        aws_pubsub_region: 'eu-west-1',
        aws_pubsub_endpoint: 'wss://a3do8wha900gm6-ats.iot.eu-west-1.amazonaws.com/mqtt',
    };

    setGaugesWindow = (gauges: any) => {
        this.gaugesWindow = gauges;
    }

    getcsharp = () => {
        return this.mapsWindow && this.mapsWindow.csharp;
    }

    subscribeAircrafts = (aircraftCertificateNames: string[]) => {
        aircraftCertificateNames.forEach(x=> {
            const aircraft = this.aircrafts.filter(y => y.aircraftCertificateName === x)[0];
            if(aircraft === undefined){
                this.aircrafts.push(new AircraftModel(x));
                this.registerAircraft(x);
            }
            else {
                this.unregisterAircraft(x);
                this.aircrafts = this.aircrafts.filter(y=> y.aircraftCertificateName !== x);
                const csharp = this.getcsharp();
                if(csharp){
                    csharp.removeAircraftByCertificateName(x);
                }
            }
        });
    };

    initializeMQTT = () => {
        console.log("initialize mqTT");
        // Apply plugin with configuration
        Amplify.addPluggable(new AWSIoTProvider(this.awsIoTProviderOptions));
        subscribeEvent(PubSubEvent.ManageAircrafts, this.subscribeAircrafts);
        this.isActive = true;
        this.publishUserStatus();
    }

    finalizeMQTT = () => {
        console.log("finalize mqTT");
        removeEvent(PubSubEvent.ManageAircrafts, this.subscribeAircrafts);
        this.isActive = false;
    }

    registerAircraft = (aircraftCertificateName: any) => {

        const aircraft = this.aircrafts.filter(x => x.aircraftCertificateName === aircraftCertificateName)[0];
        if(aircraft === undefined)
            return;
        console.log("aircraftCertificateName in register: ", aircraftCertificateName)
        const processMessages: processingFunctions = {
            processTelemetry : data => {

                let csharp = this.getcsharp();

                this.mapsWindow.window.dispatchEvent(new CustomEvent("planeChanged", {"detail": data.value}));
                setTimeout(() => {
                    this.mapsWindow.window.dispatchEvent(new CustomEvent("planeChanged", {"detail": data.value}));
                }, 2000);
                //console.log('Message received', data.value);
                let values = preprocessTelemetry(data.value);
                if (csharp) {
                    csharp.updateAircraft(values);
                    if (data.value.aircraftName === csharp.selectedAircraft.aircraftName) {
                        let setGaugeValues = this.gaugesWindow && (this.gaugesWindow as any).setValues;
                        if (setGaugeValues) {
                            setGaugeValues(values);
                        }
                        //Waypoint Current Command Expanded
                        csharp.applyCurrentCommand(data.value);
                    }
                    
                }
            },
            processStatus: (data) => {
                let csharp = this.getcsharp();
                if (csharp && data.value.aircraftName === csharp.selectedAircraft.aircraftName) {
                    setTimeout(() => {
                        csharp.receivedMission(data.value, 'mission-download');
                    }, 1000);
                }
            }
        }
        aircraft.startObserving(processMessages);
        this.mapsWindow.addEventListener("CommandRequest", aircraft.commandPublisher);

    }

    unregisterAircraft = (aircraftCertificateName: any) => {
        const aircraft = this.aircrafts.filter(x => x.aircraftCertificateName === aircraftCertificateName)[0];
        if(aircraft === undefined)
            return;

        console.log("aircraftCertificateName in unregister: ", aircraftCertificateName);
        aircraft.unregister();
        this.mapsWindow.removeEventListener("CommandRequest", aircraft.commandPublisher);
    }

    publishUserStatus = async () => {
        if(!this.isActive)
            return;
        
        const user = await Auth.currentAuthenticatedUser();
        console.log('attributes:', user.attributes);
        let req = {
            userCode: 'pilot1',
            listOfControllingAircrafts: this.aircrafts.map(x=> x.aircraftCertificateName),
            listOfObservingAircrafts: this.aircrafts.map(x=> x.aircraftCertificateName),
        };
        PubSub.publish('UL/G/' + 'pilot1' + '/S', req).then(() => {
            setTimeout(this.publishUserStatus, 1000);
        }).catch(err => {
            console.log(err);
            setTimeout(this.publishUserStatus, 1000);
        });
    };

    simulateTelemetryPublish = (certificateNameForTelemetrySimulation: string, sampleTelemetryMessage: any) => {
        PubSub.publish('UL/U/' + certificateNameForTelemetrySimulation + '/T', sampleTelemetryMessage).then(() => {
        }).catch(err => {
            console.log(err);
        });
    }

    aircraftStatusSubscription : any;
    subscribeToAircraftStatuses = (initiate: boolean) => {
        if(this.aircraftStatusSubscription != null){
            this.aircraftStatusSubscription.unsubscribe();
            console.log('stopped listening to the aircraft status messages\n');
        }
        if(initiate){
            console.log('started listening to the aircraft status messages\n');
            this.aircraftStatusSubscription = PubSub.subscribe('UL/U/+/S').subscribe({
                next: data => {
                    console.log('aircraft status message: ', data.value); 
                    publishEvent(PubSubEvent.AnyAircraftStatusMessageReceived, data.value);        
                },
                error: error => console.error(error),
                complete: () => console.log('Done'),
            });
        }
    }

    stationStatusSubscription : any;
    subscribeToControlStationStatuses = (initiate: boolean) => {
        if(this.stationStatusSubscription != null){
            this.stationStatusSubscription.unsubscribe();
            console.log('stopped listening to the user status messages\n');
        }
        if(initiate){
            console.log('started listening to the user status messages\n');
            this.stationStatusSubscription = PubSub.subscribe('UL/G/+/S').subscribe({
                next: data => {
                    console.log('user status message: ', data.value); 
                    publishEvent(PubSubEvent.AnyUserStatusMessageReceived, data.value);        
                },
                error: error => console.error(error),
                complete: () => console.log('Done'),
            });
        }
    }
}
