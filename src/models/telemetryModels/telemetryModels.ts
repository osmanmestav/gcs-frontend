export type TelemetrySummaryModel = {
    aircraftId: string,
    altitude: number,
    latitude: number,
    longitude: number,
    isSittingOnGround: boolean,
};

export type AircraftIdentifier = {
    aircraftId: string,
    aircraftName: string, 
    aircraftCertificateName: string
};