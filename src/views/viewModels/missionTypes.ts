import { WayPointModel } from "../../models/missionModels/waypointModels";
import { GeoLocationModel, GeoPointModel } from "../../models/helperModels/geoLocationModels";

export type missionDataType = {
    waypoints: waypointDataType[],
    failsafe: failsafeType,
    geoFence: geoFenceType,
    home: GeoLocationModel,
};

export type failsafeType = {
    blockRCCommandSwitch: boolean,
    climbRateToleranceForRescue: number,
    longAction: { type: number, wayPointIndex: number },
    lossOfGCSActionChoice: number,
    lossOfRCACtionChoice: number,
    rescueOnLossOfControl: boolean,
    timeLongAction: number,
    timeShortActionGCS: number,
    timeShortActionGPS: number,
    timeShortActionRC: number,
}

export type geoFenceType = {
    maxAltitude: number,
    minAltitude: number,
    points: GeoPointModel[],
    returnPoint: GeoPointModel,
    isActive: boolean,
    isVisible: boolean,
}

export interface waypointDataType extends WayPointModel {
    agl: number,
};
