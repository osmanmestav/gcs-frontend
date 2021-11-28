export type waypointDataType = {
    home: string,
    lat: number,
    command: number,
    latitude: number,
    longitude: number,
    altitude: number,
    agl: number,
    parameter: object,
};

export type missionDataType = {
    waypoints: waypointDataType[]
};
