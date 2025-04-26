
import { useState, useEffect } from 'react';
import { TimeZoneCard } from './TimeZoneCard';
import { format } from 'date-fns';

interface TimeZoneInfo {
  city: string;
  currentTime: string;
  suggestedTime?: string;
}

export const TimeZoneDisplay = () => {
  const [localTimeZone, setLocalTimeZone] = useState<string>('');
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);

  useEffect(() => {
    // Get local timezone
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLocalTimeZone(local);
  }, []);

  // This function will be called from Chat component when cities are processed
  const updateTimeZones = (cities: string[]) => {
    const now = new Date();
    const newTimeZones = cities.map(city => ({
      city,
      currentTime: format(now, 'h:mm a, EEEE, MMMM do, yyyy'),
      // Suggested time will be set when the AI processes the optimal meeting time
    }));
    setTimeZones(newTimeZones);
  };

  if (timeZones.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timeZones.map((tz, index) => (
          <TimeZoneCard
            key={`${tz.city}-${index}`}
            city={tz.city}
            currentTime={tz.currentTime}
            suggestedTime={tz.suggestedTime}
          />
        ))}
      </div>
      
      {localTimeZone && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-2">Your Local Time Zone</h3>
          <p className="text-white/60">{localTimeZone}</p>
          <p className="text-sm mt-4 text-white/60">
            Based on your location, we'll calculate the most convenient meeting times 
            for all participants.
          </p>
        </div>
      )}
    </div>
  );
};
