import { BikeIcon, CarIcon, TaxiIcon, ClockIcon } from "../Driver/icons";

const RIDE_TYPES = [
  { id: "bike",  icon: <BikeIcon size={24} />, label: "Bike", eta: "2 min away", price: "₹25", tag: "Fastest" },
  { id: "auto",  icon: <TaxiIcon size={24} />, label: "Auto", eta: "4 min away", price: "₹45", tag: "Popular" },
  { id: "cab",   icon: <CarIcon  size={24} />, label: "Cab",  eta: "6 min away", price: "₹85", tag: "Comfort" },
];

interface RideSelectorProps {
  ride: any[];
  selectedRide: string;
  onSelectRide: (vehicletype: string) => void;
}

export function RideSelector({ ride, selectedRide, onSelectRide }: RideSelectorProps) {
  const list = ride && ride.length > 0 ? ride : RIDE_TYPES;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-white/45 m-0">
          Choose a ride
        </p>
        <span className="text-[11px] font-semibold text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded-full">
          {ride && ride.length > 0 ? `${ride.length} available` : "Select route"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {list.map((r: any, index: number) => {
          const rideId = r.driver_id ?? r.id ?? `ride-${index}`;
          const isSelected = selectedRide === rideId || (selectedRide === "bike" && index === 0);

          const vehicleTypeRaw = r.vehicletype || r.label || "Bike";
          const vehicleLabel = vehicleTypeRaw.charAt(0).toUpperCase() + vehicleTypeRaw.slice(1);

          const icon = r.icon || (
            vehicleTypeRaw.toLowerCase().includes("auto") ? <TaxiIcon size={24} /> :
            vehicleTypeRaw.toLowerCase().includes("cab") || vehicleTypeRaw.toLowerCase().includes("car") ? <CarIcon size={24} /> :
            <BikeIcon size={24} />
          );

          const formattedEta = typeof r.driver_eta_sec === "number"
            ? `${Math.ceil(r.driver_eta_sec / 60)} min away`
            : (r.eta || "3 min away");

          const formattedPrice = r.price
            ? (String(r.price).startsWith("₹") ? r.price : `₹${r.price}`)
            : "₹45";

          const tagText = r.tag || (index === 0 ? "Fastest" : index === 1 ? "Popular" : "Standard");

          return (
            <button
              key={rideId}
              id={`ride-${rideId}`}
              className={`relative flex flex-col items-center p-3.5 pb-3 rounded-2xl transition-all duration-200 gap-1 border cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-[#FFD700] shadow-lg shadow-[#FFD700]/30 -translate-y-0.5 text-[#0a0a0f]"
                  : "bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.07]"
              }`}
              onClick={() => onSelectRide(r.vehicletype ?? r.id)}
            >
              <span
                className={`absolute top-1.5 right-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  isSelected ? "bg-black/15 text-[#0a0a0f]" : "bg-white/10 text-white/60"
                }`}
              >
                {tagText}
              </span>
              <div className="my-1">{icon}</div>
              <span className={`text-sm font-extrabold ${isSelected ? "text-[#0a0a0f]" : "text-white"}`}>
                {vehicleLabel}
              </span>
              <span className={`text-[11px] font-medium flex items-center gap-1 ${isSelected ? "text-[#0a0a0f]/75" : "text-white/45"}`}>
                <ClockIcon size={11} /> {formattedEta}
              </span>
              <span className={`text-base font-black mt-0.5 ${isSelected ? "text-[#0a0a0f]" : "text-[#FFD700]"}`}>
                {formattedPrice}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Also export RIDE_TYPES so RiderDashboard can use it for the book label
export { RIDE_TYPES };
