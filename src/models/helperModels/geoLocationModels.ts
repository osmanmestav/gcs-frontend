
export interface GeoPointModel {
  latitude: number;
  longitude: number;
}

export interface GeoLocationModel extends GeoPointModel {
    altitude: number;
}
