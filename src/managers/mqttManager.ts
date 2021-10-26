import "../login";
import Amplify from "@aws-amplify/core";
import PubSub, { AWSIoTProvider } from "@aws-amplify/pubsub";
import { preprocessTelemetry } from "../preprocessTelemetry";

export default class MQTTManager {
    constructor(maps: any){
        this.mapsWindow = maps;
        this.gaugesWindow = null;
    };

    mapsWindow: any;
    gaugesWindow: any;

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
        // Apply plugin with configuration
        Amplify.addPluggable(new AWSIoTProvider(this.awsIoTProviderOptions));

        PubSub.subscribe('UL/U/dev1/T').subscribe({
            next: data => {
                //console.log('Message received', data.value);
                let values = preprocessTelemetry(data.value);
                let setGaugeValues = this.gaugesWindow && (this.gaugesWindow as any).setValues;
                if (setGaugeValues){
                    setGaugeValues(values);
                }
                    
                let csharp = this.getcsharp();
                if (csharp)
                    csharp.updateAircraft(values);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });
    
        PubSub.subscribe('UL/U/dev1/M').subscribe({
            next: data => {
                console.log('Mission received', data.value);
                let csharp = this.getcsharp();
                if (csharp)
                    csharp.receivedMission(data.value);
            },
            error: error => console.error(error),
            complete: () => console.log('Done'),
        });

        var requestId = 0;
        this.mapsWindow.addEventListener("CommandRequest", (e: any) => {
            requestId++;
            e.detail.requestId = requestId;
            PubSub.publish('UL/U/dev1/C', e.detail);
        });

        this.publishHeartBeat();
    }

    publishHeartBeat = () => {
        let csharp = this.getcsharp();
        if (!csharp || !csharp.selectedAircraft || !csharp.selectedAircraft.aircraftId) {
            setTimeout(this.publishHeartBeat, 1000);
            return;
        }
        let req = {
            aircraftId: csharp.selectedAircraft.aircraftId,
            aircraftName: csharp.selectedAircraft.aircraftName,
            command: "HeartBeat",
            requestId: 0
        };
        PubSub.publish('UL/U/dev1/C', req).then(() => {
            console.log("Sent heartbeat");
            setTimeout(this.publishHeartBeat, 1000);
        }).catch(err => {
            console.log(err);
            setTimeout(this.publishHeartBeat, 1000);
        });
    };

    publishTelemetry = (sampleTelemetryMessage: any) => {
        PubSub.publish('UL/U/dev1/T', sampleTelemetryMessage).then(() => {
        }).catch(err => {
            console.log(err);
        });
    }
}