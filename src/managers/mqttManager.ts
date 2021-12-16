import "../login";
import Amplify from "@aws-amplify/core";
import PubSub, {AWSIoTProvider} from "@aws-amplify/pubsub";
import {preprocessTelemetry} from "../preprocessTelemetry";
import { publishEvent, PubSubEvent, removeEvent, subscribeEvent } from "../utils/PubSubService";

class AircraftModel {
    constructor(name: string){
        this.aircraftCertificateName = name;
    }
    aircraftCertificateName: string;
    telemetrySubscription: any;
    missionSubscription: any;
    heartbeatSubscription: any;
    commandPublisher: any;

    addTelemetrySubscription(tSub: any){
        this.telemetrySubscription = tSub;
    };
    addMissionSubscription(tSub: any){
        this.missionSubscription = tSub;
    };
    addHeartbeatSubscription(tSub: any){
        this.heartbeatSubscription = tSub;
    };
    addCommandPublisher(pub: any){
        this.commandPublisher = pub;
    };

    unregister(){
        this.telemetrySubscription.unsubscribe();
        this.missionSubscription.unsubscribe();
        this.heartbeatSubscription?.unsubscribe();

    };
}

export default class MQTTManager {
    constructor(maps: any) {
        this.mapsWindow = maps;
        this.gaugesWindow = null;
        this.aircrafts = [];
    };

    mapsWindow: any;
    gaugesWindow: any;
    aircrafts: AircraftModel[];

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
    }

    finalizeMQTT = () => {
        console.log("finalize mqTT");
        removeEvent(PubSubEvent.ManageAircrafts, this.subscribeAircrafts);
    }

    registerAircraft = (aircraftCertificateName: any) => {

        const aircraft = this.aircrafts.filter(x => x.aircraftCertificateName === aircraftCertificateName)[0];
        if(aircraft === null)
            return;
        console.log("aircraftCertificateName in register: ", aircraftCertificateName)


        const telemetry = PubSub.subscribe('UL/U/' + aircraftCertificateName + '/T').subscribe({
            next: data => {

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
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        aircraft.addTelemetrySubscription(telemetry);
        

        const mission = PubSub.subscribe('UL/U/' + aircraftCertificateName + '/M').subscribe({
            next: data => {
                console.log('Mission received', data.value);
                let csharp = this.getcsharp();
                if (csharp && data.value.aircraftName === csharp.selectedAircraft.aircraftName) {
                    setTimeout(() => {
                        csharp.receivedMission(data.value, 'mission-download');
                    }, 1000);
                }
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
        aircraft.addMissionSubscription(mission);

        const onCommandRequest = (e: any) => {
            let requestId = 0;
            let csharp = this.getcsharp();
            if (csharp && aircraftCertificateName === csharp.selectedAircraft.aircraftCertificateName) {
                requestId++;
                e.detail.requestId = requestId;
                PubSub.publish('UL/U/' + aircraftCertificateName + '/C', e.detail);
            }
        }
        aircraft.addCommandPublisher(onCommandRequest);
        // this is no good but harmless for now. All aircrafts listen to the same event - but fortunately adapter drops if name and/or id does not match
        this.mapsWindow.addEventListener("CommandRequest", aircraft.commandPublisher);

        // this.publishHeartBeat(aircraftCertificateName);
    }

    unregisterAircraft = (aircraftCertificateName: any) => {
        const aircraft = this.aircrafts.filter(x => x.aircraftCertificateName === aircraftCertificateName)[0];
        if(aircraft === undefined)
            return;

        console.log("aircraftCertificateName in unregister: ", aircraftCertificateName);
        aircraft.unregister();
        this.mapsWindow.removeEventListener("CommandRequest", aircraft.commandPublisher);

    }

    publishHeartBeat = (aircraftCertificateName: any) => {
        let csharp = this.getcsharp();
        if (!csharp || !csharp.selectedAircraft || !csharp.selectedAircraft.aircraftId) {
            setTimeout(this.publishHeartBeat, 1000, aircraftCertificateName);
            return;
        }
        let req = {
            aircraftId: csharp.selectedAircraft.aircraftId,
            aircraftName: csharp.selectedAircraft.aircraftName,
            command: "HeartBeat",
            requestId: aircraftCertificateName
        };
        PubSub.publish('UL/U/' + aircraftCertificateName + '/C', req).then(() => {
            //console.log("Sent heartbeat");
            setTimeout(this.publishHeartBeat, 1000, aircraftCertificateName);
        }).catch(err => {
            console.log(err);
            setTimeout(this.publishHeartBeat, 1000, aircraftCertificateName);
        });
    };

    simulateTelemetryPublish = (certificateNameForTelemetrySimulation: string, sampleTelemetryMessage: any) => {
        PubSub.publish('UL/U/' + certificateNameForTelemetrySimulation + '/T', sampleTelemetryMessage).then(() => {
        }).catch(err => {
            console.log(err);
        });
    }

    allStatus : any;
    manageAircrafts = (initiate: boolean) => {

        if(this.allStatus != null){
            this.allStatus.unsubscribe();
            console.log('stopped listening to the status messages\n');
        }
        if(initiate){
            console.log('started listening to the status messages\n');
            this.allStatus = PubSub.subscribe('UL/U/+/S').subscribe({
                next: data => {
                    console.log('status message: ', data.value); 
                    publishEvent(PubSubEvent.StatusMessageReceivedOnAircraftManagement, data.value);        
                },
                error: error => console.error(error),
                complete: () => console.log('Done'),
            });
        }
    }
}
