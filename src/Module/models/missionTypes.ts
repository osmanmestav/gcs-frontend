import { WayPointModel } from "../../models/missionModels/waypointModels";

export type missionDataType = {
    waypoints: waypointDataType[],
    failsafe: failsafeType,
    geoFence: geoFenceType,
    home: homeType,
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
    points: [],
    returnPoint: { latitude: number, longitude: number },
    isActive: boolean,
    isVisible: boolean,
}

export interface waypointDataType extends WayPointModel {
    agl: number,
};


export type homeType = {
    altitude: number,
    latitude: number,
    longitude: number,
}
