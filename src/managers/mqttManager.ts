import "../login";
import Amplify from "@aws-amplify/core";
import PubSub, {AWSIoTProvider} from "@aws-amplify/pubsub";
import {preprocessTelemetry} from "../preprocessTelemetry";

interface AircraftModel {
    aircraftId: number,
    aircraftName: string,
    certificationName: string,
    isSubscribed: boolean,
    isSelected: boolean
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

    initializeMQTT = () => {
        console.log("initialize mqTT");
        // Apply plugin with configuration
        Amplify.addPluggable(new AWSIoTProvider(this.awsIoTProviderOptions));
        this.AircraftSubscribe("dev1");
        this.AircraftSubscribe("dev2");
        this.AircraftSubscribe("dev3");
        this.AircraftSubscribe("dev4");
    }

    finalizeMQTT = () => {
        console.log("finalize mqTT");
    }

    AircraftSubscribe = (aircraftCertificateName: any) => {

        console.log("aircraftCertificateName in subscribe: ", aircraftCertificateName)
        PubSub.subscribe('UL/U/' + aircraftCertificateName + '/T').subscribe({
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

        PubSub.subscribe('UL/U/' + aircraftCertificateName + '/M').subscribe({
            next: data => {
                console.log('Mission received', data.value);
                let csharp = this.getcsharp();
                if (csharp && data.value.aircraftName === csharp.selectedAircraft.aircraftName) {
                    setTimeout(() => {
                        csharp.receivedMission(data.value);
                    }, 1000);
                }
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });

        // this is no good but harmless for now. All aircrafts listen to the same event - but fortunately adapter drops if name and/or id does not match
        var requestId = 0;
        this.mapsWindow.addEventListener("CommandRequest", (e: any) => {
            requestId++;
            e.detail.requestId = requestId;
            PubSub.publish('UL/U/' + aircraftCertificateName + '/C', e.detail);
        });


        this.publishHeartBeat(aircraftCertificateName);
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

    // obsolete - no more in use...
    publishTelemetry = (sampleTelemetryMessage: any) => {
        PubSub.publish('UL/U/dev1/T', sampleTelemetryMessage).then(() => {
        }).catch(err => {
            console.log(err);
        });
    }
}
