type Tab = "map" | "trips" | "earnings";

const TABS: { icon: string; label: string; tab: Tab }[] = [
  { icon: "🗺", label: "Map", tab: "map" },
  { icon: "🏍", label: "Trips", tab: "trips" },
  { icon: "💰", label: "Earnings", tab: "earnings" },
];

interface DriverBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function DriverBottomNav({ activeTab, onTabChange }: DriverBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-3"
      style={{
        background: "rgba(10,10,15,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {TABS.map(({ icon, label, tab }) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className="flex flex-col items-center gap-1 px-5 py-1 rounded-xl transition-all duration-200"
          style={{
            color: activeTab === tab ? "#FFD700" : "rgba(255,255,255,0.35)",
          }}
        >
          <span className="text-xl">{icon}</span>
          <span className="text-[10px] font-bold">{label}</span>
          {activeTab === tab && (
            <span className="w-1 h-1 rounded-full" style={{ background: "#FFD700" }} />
          )}
        </button>
      ))}
    </nav>
  );
}
