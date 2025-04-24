import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
function formatDateTime(date: Date) {
  // Example: Monday, Apr 21, 14:05
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  }) + " " + date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  }).replace(":", ":");
}
export const DateTimeDisplay: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return <div className="flex flex-col items-center mb-2 animate-fade-in transition-all duration-200">
      <div className="flex items-center gap-1 text-neutral-500 text-xs sm:text-sm font-semibold font-mono">
        <Clock className="h-4 w-4 stroke-[1.8]" />
        <span className="mx-[6px] px-[4px] py-[2px] text-center">{formatDateTime(now)}</span>
      </div>
    </div>;
};