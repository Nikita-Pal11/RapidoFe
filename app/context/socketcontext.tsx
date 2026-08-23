
"use client";

import { useEffect, useRef, useState, useCallback, ReactNode, createContext,useContext } from "react";
import { useAuth } from "./AuthContext";
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";
import { RideStatusEvent,NewRideRequestEvent, SocketEvent, SocketContextType} from "./type";
const SocketContext = createContext<SocketContextType | undefined>(undefined)
export function SocketProvider({children}:{children:ReactNode}){
  const { token } = useAuth();
  const rideWsRef = useRef<WebSocket | null>(null);
  
  const locationWsRef = useRef<WebSocket | null>(null);
  const driverWsRef = useRef<WebSocket | null>(null);

  const rideReconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const driverReconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rideEvent, setRideEvent] = useState<RideStatusEvent | null>(null);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [incomingRideRequest, setIncomingRideRequest] =
    useState<NewRideRequestEvent | null>(null);

  const connectRideSocket = useCallback((rideid: number) => {
    if (rideWsRef.current) rideWsRef.current.close();
    const ws = new WebSocket(`${WS_BASE}/ws/ride/${rideid}/?token=${token || ""}`);
    rideWsRef.current = ws;
    ws.onopen = () => console.log("");
    ws.onmessage = (e) => {
      try {
        const data: SocketEvent = JSON.parse(e.data);
        if (data.type === "RIDE_STATUS_UPDATE") setRideEvent(data);
      } catch {
        console.warn("[RideSocket] Bad message", e.data);
      }
    };
    ws.onclose = (e) => {
      console.warn("[RideSocket] Closed", e.code);
      if (e.code !== 1000) {
        rideReconnectRef.current = setTimeout(
          () => connectRideSocket(rideid),
          3000,
        );
      }
    };
    ws.onerror = (e) => console.error("[RideSocket] Error", e);
  }, [token]);

  const disconnectRideSocket = useCallback(() => {
    if (rideReconnectRef.current) clearTimeout(rideReconnectRef.current);
    rideWsRef.current?.close(1000, "intentional");
    rideWsRef.current = null;
    setRideEvent(null);
  }, []);

  // ── 2. RIDER & DRIVER — Live Location Socket
  const connectLocationSocket = useCallback((rideId: number) => {
    if (locationWsRef.current) locationWsRef.current.close();
    const ws = new WebSocket(`${WS_BASE}/ws/location/${rideId}/?token=${token || ""}`);
    locationWsRef.current = ws;

    ws.onopen = () => console.log("");
    ws.onmessage = (e) => {
      try {
        const data: SocketEvent = JSON.parse(e.data);
        if (data.type === "DRIVER_LOCATION_UPDATE") {
          setDriverLocation({ lat: Number(data.lat), lng: Number(data.lng) });
        }
      } catch {
        console.warn("[LocationSocket] Bad message", e.data);
      }
    };
    ws.onclose = (e) => console.warn("[LocationSocket] Closed", e.code);
    ws.onerror = (e) => console.error("[LocationSocket] Error", e);
  }, [token]);
  const disconnectLocationSocket = useCallback(() => {
    locationWsRef.current?.close(1000, "intentional");
    locationWsRef.current = null;
    setDriverLocation(null);
  }, []);

  // ── 3. DRIVER — Notification Socket
  const connectDriverSocket = useCallback(() => {
    if (driverWsRef.current) driverWsRef.current.close();
    const ws = new WebSocket(`${WS_BASE}/ws/driver/notifications/?token=${token || ""}`);
    driverWsRef.current = ws;
    ws.onopen = () => console.log("[DriverSocket] Connected");
    ws.onmessage = (e) => {
      try {
        const data: SocketEvent = JSON.parse(e.data);
        if (data.type === "NEW_RIDE_REQUEST") setIncomingRideRequest(data);
      } catch {
        console.warn("[DriverSocket] Bad message", e.data);
      }
    };
    ws.onclose = (e) => {
      console.warn("[DriverSocket] Closed", e.code);
      if (e.code !== 1000) {
        driverReconnectRef.current = setTimeout(
          () => connectDriverSocket(),
          3000,
        );
      }
    };
    ws.onerror = (e) => console.error("[DriverSocket] Error", e);
  }, [token]);
  const disconnectDriverSocket = useCallback(() => {
    if (driverReconnectRef.current) clearTimeout(driverReconnectRef.current);
    driverWsRef.current?.close(1000, "intentional");
    driverWsRef.current = null;
  }, []);

  // ── 4. DRIVER — Push GPS coords through LocationConsumer

  const sendDriverLocation = useCallback(
    (
      rideId: number,
      lat: number,
      lng: number,
      driverId: number,
      vehicleType: string,
    ) => {
      const payload = JSON.stringify({
        lat,
        lng,
        driver_id: driverId,
        vehicle_type: vehicleType,
      });
      if (
        !locationWsRef.current ||
        locationWsRef.current.readyState !== WebSocket.OPEN
      ) {
        connectLocationSocket(rideId);
        setTimeout(() => locationWsRef.current?.send(payload), 500);
        return;
      }
      locationWsRef.current.send(payload);
    },
    [connectLocationSocket],
  );
  const clearIncomingRide = useCallback(() => setIncomingRideRequest(null), []);
  useEffect(() => {
    return () => {
      disconnectRideSocket();
      disconnectLocationSocket();
      disconnectDriverSocket();
    };
  }, [disconnectRideSocket, disconnectLocationSocket, disconnectDriverSocket]);
return (
  <SocketContext.Provider
    value={{
      connectRideSocket,
      disconnectRideSocket,
      rideEvent,
      connectLocationSocket,
      disconnectLocationSocket,
      driverLocation,
      connectDriverSocket,
      disconnectDriverSocket,
      incomingRideRequest,
      clearIncomingRide,
      sendDriverLocation,
    }}
  >
    {" "}
    {children}{" "}
  </SocketContext.Provider>
);
}
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}


