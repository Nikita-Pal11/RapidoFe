import { useEffect, useState } from "react"

function CurrentLocation() {
   const [currentPosition, setCurrentPosition] = useState<
     [number, number] | undefined
   >(undefined);
   useEffect(() => {
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (position) => {
           setCurrentPosition([
             position.coords.latitude,
             position.coords.longitude,
           ]);
         },
         () => {
           setCurrentPosition([28.6139, 77.209]); // Default to Delhi if permission denied
         },
       );
     }
   }, []);
   return currentPosition
}

export default CurrentLocation
    