export type TelemetrySummaryModel = {
    aircraftId: number,
    altitude: number,
    latitude: number,
    longitude: number,
    isSittingOnGround: boolean,
};

export type AircraftIdentifier = {
    aircraftId: number,
    aircraftName: string, 
    aircraftCertificateName: string
};