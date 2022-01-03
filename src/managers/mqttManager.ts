import "../login";
import Amplify from "@aws-amplify/core";
import PubSub, {AWSIoTProvider} from "@aws-amplify/pubsub";
import {preprocessTelemetry} from "../preprocessTelemetry";
import {publishEvent, PubSubEvent, removeEvent, subscribeEvent} from "../utils/PubSubService";
import {Auth} from "aws-amplify";
import {processingFunctions} from "../models/managerModels/aircraftModel";
import FlightData from "./flightData";
import { UserStatusTopicMessage } from "../models/brokerModels/userStatusTopicMessage";
import { AircraftStatusTopicMessage } from "../models/brokerModels/aircraftStatusTopicMessage";
import { AircraftPilotageStatus, PilotageState } from "../models/aircraftModels/aircraft";
import { UserCredentials } from "../models/userModels/userCredentials";
import { publishSummaryLog, SummaryLogType } from "../models/helperModels/summaryLog";
// import { getEnumKeyByEnumValue, getEnumKeys, getEnumKeyValuePairs, getEnumValueByEnumKey, getEnumValues } from "../utils/enumHelpers";
// import { UnitsHelperNew, UnitSystemEnum, UnitTypeEnum } from "../utils/unitsHelperNew";


export default class MQTTManager {
    constructor(maps: any, user: UserCredentials) {
        this.mapsWindow = maps;
        this.userCredentials = user;
        this.gaugesWindow = null;
        this.flightData = new FlightData(user, maps);
        this.isActive = false;
    };

    mapsWindow: any;
    gaugesWindow: any;
    flightData: FlightData;
    isActive: boolean;
    userCredentials: UserCredentials;
    setGaugesWindow = (gauges: any) => {
        this.gaugesWindow = gauges;
    }

    getcsharp = () => {
        return this.mapsWindow && this.mapsWindow.csharp;
    }

    subscribeAircrafts = (pilotage: AircraftPilotageStatus[]) => {
        pilotage.forEach(x => {
            console.log("state:", x.state)
            var aircraft = this.flightData.aircraftFleet.getAircraftByCertificateName(x.aircraftIdentifier.aircraftCertificateName);
            console.log("status:", aircraft)
            if (aircraft === null) {
                if (x.state !== PilotageState.None) {
                    this.flightData.aircraftFleet.insert(x.aircraftIdentifier);
                    const isControlling = x.state === PilotageState.Controlling;
                    this.registerAircraft(x.aircraftIdentifier.aircraftCertificateName, isControlling);
                    const msg = "Started " + (isControlling ? "controlling " : "observing ") + x.aircraftIdentifier.aircraftName;
                    publishSummaryLog(msg, SummaryLogType.Message);
                }
            } else {
                if (x.state === PilotageState.None) {
                    this.unregisterAircraft(x.aircraftIdentifier.aircraftCertificateName);
                    this.flightData.aircraftFleet.remove(x.aircraftIdentifier.aircraftCertificateName);
                    const csharp = this.getcsharp();
                    if (csharp) {
                        csharp.removeAircraftByCertificateName(x.aircraftIdentifier.aircraftCertificateName);
                    }
                    this.flightData.checkActiveAircraftPilotageState(x.aircraftIdentifier, x.state);
                    publishSummaryLog("Disconnected from " + x.aircraftIdentifier.aircraftName, SummaryLogType.Warning);
                }
                else if(x.state === PilotageState.Controlling && aircraft.isObservingButNotControlling()) {
                    aircraft.requestClaim();
                    this.flightData.checkActiveAircraftPilotageState(x.aircraftIdentifier, x.state);
                    publishSummaryLog("Requesting control of " + x.aircraftIdentifier.aircraftName, SummaryLogType.Message);
                }
            }
        });
        this.flightData.refreshAircraftPilotageState();
    };

    initializeMQTT = () => {
        console.log("initialize mqTT");
        Auth.currentCredentials().then(user => {
            Amplify.addPluggable(
                new AWSIoTProvider({
                    aws_pubsub_region: 'eu-west-1',
                    aws_pubsub_endpoint: 'wss://a3do8wha900gm6-ats.iot.eu-west-1.amazonaws.com/mqtt',
                    // if this is set then identity works in single browser (last comes takes service)
                    // clientId: user.identityId
                })
            );
            console.log("IdentityId: ", user.identityId);
            this.publishUserStatus();
        });

        subscribeEvent(PubSubEvent.ManageAircraftsEvent, this.subscribeAircrafts);
        this.isActive = true;


        // console.log(UnitsHelperNew.unitDictionaryNew);
        // console.log(getEnumKeyValuePairs(UnitSystemEnum));
        // console.log(getEnumValueByEnumKey(UnitSystemEnum, "SI"));
        // console.log(getEnumKeyByEnumValue(UnitSystemEnum, UnitSystemEnum.US));
        // console.log(getEnumKeys(UnitSystemEnum));
        // console.log(getEnumValues(UnitSystemEnum));
    }

    finalizeMQTT = () => {
        console.log("finalize mqTT");
        removeEvent(PubSubEvent.ManageAircraftsEvent, this.subscribeAircrafts);
        this.isActive = false;
    }

    registerAircraft = (aircraftCertificateName: string, requestClaim: boolean) => {
        var aircraft = this.flightData.aircraftFleet.getAircraftByCertificateName(aircraftCertificateName);
        if (aircraft === null)
            return;
        console.log("aircraftCertificateName in register: ", aircraftCertificateName)
        const processMessages: processingFunctions = {
            processTelemetry: data => {
                let csharp = this.getcsharp();

                this.mapsWindow.window.dispatchEvent(new CustomEvent("planeChanged", {"detail": data.value}));
                setTimeout(() => {
                    this.mapsWindow.window.dispatchEvent(new CustomEvent("planeChanged", {"detail": data.value}));
                }, 2000);
                // console.log('Message received', data.value);
                let values = preprocessTelemetry(data.value);
                if (csharp) {
                    // this.flightData.insertTelemetryMessage(data.value);
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
            processMission: (data) => {
                let csharp = this.getcsharp();
                    setTimeout(() => {
                        if (csharp && csharp.selectedAircraft && data.value.aircraftName === csharp.selectedAircraft.aircraftName) {
                            csharp.receivedMission(data.value, 'mission-download');
                        }
                    }, 1000);
            },
            processStatus: (data) => {
            },
            processParameters: (data) => {
            },
        }
        aircraft.startObserving(processMessages, requestClaim);
        this.mapsWindow.addEventListener("CommandRequest", aircraft.commandPublisher);

    }

    unregisterAircraft = (aircraftCertificateName: string) => {
        var aircraft = this.flightData.aircraftFleet.getAircraftByCertificateName(aircraftCertificateName);
        if (aircraft === null)
            return;

        console.log("aircraftCertificateName in unregister: ", aircraftCertificateName);
        aircraft.unregister();
        this.mapsWindow.removeEventListener("CommandRequest", aircraft.commandPublisher);
    }

    publishUserStatus = async () => {
        if (!this.isActive)
            return;

        // const user = await Auth.currentAuthenticatedUser();
        // console.log('attributes:', user.attributes);
        let req = {
            userCode: this.userCredentials.userCode,
            listOfControllingAircrafts: this.flightData.aircraftFleet.getListOfControllingAircrafts().map(x=> x.aircraftCertificateName),
            listOfObservingAircrafts: this.flightData.aircraftFleet.getListOfObservingAircrafts().map(x=> x.aircraftCertificateName),
        };
        PubSub.publish(this.userCredentials.getUserStatusTopicString(), req).then(() => {
            setTimeout(this.publishUserStatus, 1000);
        }).catch(err => {
            console.log(err);
            setTimeout(this.publishUserStatus, 1000);
        });
    };

    simulateTelemetryPublish = (certificateNameForTelemetrySimulation: string, sampleTelemetryMessage: any) => {
        PubSub.publish(this.userCredentials.getSimulateTelemetryTopicString(certificateNameForTelemetrySimulation), sampleTelemetryMessage).then(() => {
        }).catch(err => {
            console.log(err);
        });
    }

    aircraftStatusSubscription: any;
    subscribeToAircraftStatuses = (initiate: boolean) => {
        if (this.aircraftStatusSubscription != null) {
            this.aircraftStatusSubscription.unsubscribe();
            console.log('stopped listening to the aircraft status messages\n');
        }
        if (initiate) {
            console.log('started listening to the aircraft status messages\n');
            this.aircraftStatusSubscription = PubSub.subscribe(this.userCredentials.getAircraftStatusesTopicString()).subscribe({
                next: data => {
                    // console.log('aircraft status message: ', data.value);
                    const aircraftStatusMsg = new AircraftStatusTopicMessage();
                    aircraftStatusMsg.aircraftId = data.value.aircraftID;
                    aircraftStatusMsg.aircraftName = data.value.aircraftName;
                    aircraftStatusMsg.aircraftCertificateName = data.value.aircraftCertificateName;
                    aircraftStatusMsg.gcsController = {
                        userCode: data.value.gcsController.userCode,
                        userName: data.value.gcsController.userName,
                    };
                    publishEvent(PubSubEvent.AnyAircraftStatusMessageReceived, aircraftStatusMsg);
                },
                error: error => console.error(error),
                complete: () => console.log('Done'),
            });
        }
    }

    stationStatusSubscription: any;
    subscribeToControlStationStatuses = (initiate: boolean) => {
        if (this.stationStatusSubscription != null) {
            this.stationStatusSubscription.unsubscribe();
            console.log('stopped listening to the user status messages\n');
        }
        if (initiate) {
            console.log('started listening to the user status messages\n');
            this.stationStatusSubscription = PubSub.subscribe(this.userCredentials.getControlStationStatusesTopicString()).subscribe({
                next: data => {
                    // console.log('user status message: ', data.value);
                    const userStatusMsg = new UserStatusTopicMessage(data.value.userCode);
                    userStatusMsg.listOfObservingAircrafts = data.value.listOfObservingAircrafts;
                    userStatusMsg.listOfControllingAircrafts = data.value.listOfControllingAircrafts;
                    publishEvent(PubSubEvent.AnyUserStatusMessageReceived, userStatusMsg);
                },
                error: error => console.error(error),
                complete: () => console.log('Done'),
            });
        }
    }
}

