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

export type waypointDataType = {
    index: number,
    lat: number,
    command: string,
    latitude: number,
    longitude: number,
    altitude: number,
    agl: number,
    parameter: any,
};


export type homeType = {
    altitude: number,
    latitude: number,
    longitude: number,
}

export type TelemetrySummaryModel = {
    aircraftId: string,
    altitude: number,
    latitude: number,
    longitude: number,
    isSittingOnGround: boolean,
}
