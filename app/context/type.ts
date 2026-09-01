export interface RideStatusEvent {
  type: "RIDE_STATUS_UPDATE";
  status:
    | "accepted"
    | "driver_arrived"
    | "started"
    | "completed"
    | "canceled"
    | "no_drivers"
    | "payment_pending"
  driver_id?: number;
  message?: string;
}

export interface NewRideRequestEvent {
  type: "NEW_RIDE_REQUEST";
  ride_id: number;
  pickup_location: string;
  dropoff_location: string;
  pickup_lat: number;
  pickup_long: number;
  drop_lat: number,
  drop_long: number,
  fare: number;
  timeout_seconds: number;
}

export interface DriverLocationEvent {
  type: "DRIVER_LOCATION_UPDATE";
  driver_id: number;
  lat: number;
  lng: number;
}

export type SocketEvent =
  | RideStatusEvent
  | NewRideRequestEvent
  | DriverLocationEvent;


export interface SocketContextType {
  connectRideSocket: (rideId: number) => void;
  disconnectRideSocket: () => void;
  rideEvent: RideStatusEvent | null;
  connectLocationSocket: (rideId: number) => void;
  disconnectLocationSocket: () => void;
  driverLocation: { lat: number; lng: number } | null;
  connectDriverSocket: () => void;
  disconnectDriverSocket: () => void;
  incomingRideRequest: NewRideRequestEvent | null;
  setIncomingRideRequest: React.Dispatch<React.SetStateAction<NewRideRequestEvent | null>>;
  clearIncomingRide: () => void;
  sendDriverLocation: (
    rideId: number,
    lat: number,
    lng: number,
    driverId: number,
    vehicleType: string,
  ) => void;
}