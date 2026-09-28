import { useEffect, useState } from "react";
import { WifiIcon } from "@heroicons/react/24/outline";

/** Tells users when they're offline; data requests resume automatically when back online. */
export default function OfflineBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-white">
      <WifiIcon className="h-4 w-4" aria-hidden="true" />
      You're offline. We'll reconnect automatically.
    </div>
  );
}
