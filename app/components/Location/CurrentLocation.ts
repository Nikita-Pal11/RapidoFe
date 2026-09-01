import { useEffect, useState } from "react";

function CurrentLocation() {
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | undefined
  >(undefined);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentPosition([28.6139, 77.209]); // Default fallback
      return;
    }

    // Continuous watchPosition for live moving GPS coordinates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        console.warn("Geolocation watch error:", error);
        setCurrentPosition((prev) => prev || [28.6139, 77.209]);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return currentPosition;
}

export default CurrentLocation;