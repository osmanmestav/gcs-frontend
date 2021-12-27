import "../login";
import Amplify from "@aws-amplify/core";
import PubSub, {AWSIoTProvider} from "@aws-amplify/pubsub";
import {preprocessTelemetry} from "../preprocessTelemetry";
import {publishEvent, PubSubEvent, removeEvent, subscribeEvent} from "../utils/PubSubService";
import {Auth} from "aws-amplify";
import {processingFunctions} from "../models/managerModels/aircraftModel";
import FlightData from "./flightData";
import {AircraftPilotageStatus, PilotageState} from "../views/components/AircraftsManagement/AircraftsListModal";
import { UserStatusTopicMessage } from "../models/brokerModels/userStatusTopicMessage";
import { AircraftStatusTopicMessage } from "../models/brokerModels/aircraftStatusTopicMessage";
// import { getEnumKeyByEnumValue, getEnumKeys, getEnumKeyValuePairs, getEnumValueByEnumKey, getEnumValues } from "../utils/enumHelpers";
// import { UnitsHelperNew, UnitSystemEnum, UnitTypeEnum } from "../utils/unitsHelperNew";

const getUserCode = (pathName: string) => {
    const splitted = pathName.split('/')
    if(splitted.length > 1 && splitted[1] !== '')  {
        return splitted[1];
    }
    return 'pilot1';
}

export const defaultUserCode: string = getUserCode(window.location.pathname);
export default class MQTTManager {
    constructor(maps: any) {
        
        this.mapsWindow = maps;
        this.gaugesWindow = null;
        debugger;
        this.flightData = new FlightData(defaultUserCode);
        this.isActive = false;
    };


    mapsWindow: any;
    gaugesWindow: any;
    flightData: FlightData;
    isActive: boolean;

    setGaugesWindow = (gauges: any) => {
        this.gaugesWindow = gauges;
    }

    getcsharp = () => {
        return this.mapsWindow && this.mapsWindow.csharp;
    }

    subscribeAircrafts = (pilotage: AircraftPilotageStatus[]) => {
        pilotage.forEach(x => {
            console.log("state:", x.state)
            var anyAircraft = this.flightData.aircraftFleet.any(x.name);
            console.log("status:", anyAircraft)
            if (anyAircraft === false) {
                if (x.state !== PilotageState.None) {
                    this.flightData.aircraftFleet.insert(x.name);
                    this.registerAircraft(x.name, x.state === PilotageState.Controlling);
                }
            } else {
                // var observingList = this.flightData.aircraftFleet.getListOfObservingAircraftCertificateNames();
                if (x.state === PilotageState.None) {
                    this.unregisterAircraft(x.name);
                    this.flightData.aircraftFleet.remove(x.name);
                    const csharp = this.getcsharp();
                    if (csharp) {
                        csharp.removeAircraftByCertificateName(x.name);
                    }
                }
            }
        });
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

        subscribeEvent(PubSubEvent.ManageAircrafts, this.subscribeAircrafts);
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
        removeEvent(PubSubEvent.ManageAircrafts, this.subscribeAircrafts);
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
            userCode: defaultUserCode,
            listOfControllingAircrafts: this.flightData.aircraftFleet.getListOfControllingAircraftCertificateNames(),
            listOfObservingAircrafts: this.flightData.aircraftFleet.getListOfObservingAircraftCertificateNames(),
        };
        PubSub.publish('UL/G/' + defaultUserCode + '/S', req).then(() => {
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

    aircraftStatusSubscription: any;
    subscribeToAircraftStatuses = (initiate: boolean) => {
        if (this.aircraftStatusSubscription != null) {
            this.aircraftStatusSubscription.unsubscribe();
            console.log('stopped listening to the aircraft status messages\n');
        }
        if (initiate) {
            console.log('started listening to the aircraft status messages\n');
            this.aircraftStatusSubscription = PubSub.subscribe('UL/U/+/S').subscribe({
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
            this.stationStatusSubscription = PubSub.subscribe('UL/G/+/S').subscribe({
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

