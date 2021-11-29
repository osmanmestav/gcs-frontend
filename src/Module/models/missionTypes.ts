export type missionDataType = {
    waypoints: waypointDataType[],
    failsafe: failsafeType,
    geoFence: geoFenceType,
    home: homeType,
};

export type failsafeType = {
    isFromDownload: boolean,
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
    isFromDownload: boolean,
    maxAltitude: number,
    minAltitude: number,
    points: [],
    returnPoint: { latitude: number, longitude: number },
    isActive: boolean,
    isVisible: boolean,
}

export type waypointDataType = {
    isFromDownload: boolean,
    home: string,
    lat: number,
    command: number,
    latitude: number,
    longitude: number,
    altitude: number,
    agl: number,
    parameter: object,
};


export type homeType = {
    isFromDownload: boolean,
    altitude: number,
    latitude: number,
    longitude: number,
}
