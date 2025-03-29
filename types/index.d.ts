export interface Station {
  id: string
  name: string
  location: firebase.firestore.GeoPoint
  docks: number
  bikes: string[]
}

export interface Bike {
  id: string;
  location: BikeLocation;
  status: "available" | "charging" | "reserved" | "in_use";
  battery: number;
  reservedBy?: string | null;
  reservedAt?: any;
  stationId?: string | null;
}

export interface BikeLocation {
  latitude: number;
  longitude: number;
}

export interface ActiveReservation {
  bikeId: string;
  location: {
    lat: number;
    lng: number;
  };
  battery: number;
  fromStationId: string | null;
  reservedAt: Date;
}

export interface RouteSegment {
  start: google.maps.LatLngLiteral;
  end: google.maps.LatLngLiteral;
  distance: number; // meters
  duration: number; // seconds
}

export interface ActiveRoute {
  startedAt: string;
  bikeId: string;
  from: google.maps.LatLngLiteral;
  to: google.maps.LatLngLiteral;
  polyline: google.maps.LatLngLiteral[];
  distance: number; // meters
  duration: number; // seconds
  segments: RouteSegment[];
}
