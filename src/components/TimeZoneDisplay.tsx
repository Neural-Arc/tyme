
import { useState, useEffect } from 'react';
import { TimeZoneCard } from './TimeZoneCard';
import { format } from 'date-fns';
import { Card } from './ui/card';
import { MapPin } from 'lucide-react';

interface TimeZoneInfo {
  city: string;
  currentTime: string;
  suggestedTime?: string;
}

export const TimeZoneDisplay = () => {
  const [localTimeZone, setLocalTimeZone] = useState<string>('');
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [bestCallTime, setBestCallTime] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');

  useEffect(() => {
    // Get local timezone
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLocalTimeZone(local);
    
    // Try to get user's city name from timezone
    const city = local.split('/').pop()?.replace(/_/g, ' ');
    setUserLocation(city || 'Local Time');
    
    // Set initial local time card
    setTimeZones([{
      city: city || 'Local Time',
      currentTime: format(new Date(), 'h:mm a, EEEE, MMMM do, yyyy'),
    }]);
  }, []);

  // Update this function to handle incoming timezone data from Chat
  const updateTimeZones = (cities: string[], suggestedTime?: string) => {
    const now = new Date();
    const newTimeZones = cities.map(city => ({
      city,
      currentTime: format(now, 'h:mm a, EEEE, MMMM do, yyyy'),
    }));
    setTimeZones(newTimeZones);
    if (suggestedTime) {
      setBestCallTime(suggestedTime);
    }
  };

  return (
    <div className="space-y-8">
      {/* User's Location Time Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-white/60" />
          <h3 className="text-lg font-medium">Your Location: {userLocation}</h3>
        </div>
        <p className="text-white/60">{localTimeZone}</p>
      </div>

      {/* Time Cards Grid */}
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
      
      {/* Best Call Time Section */}
      {bestCallTime && (
        <div className="glass-card p-6 mt-6">
          <h3 className="text-lg font-medium mb-2">Best Time for the Call</h3>
          <p className="text-xl font-bold text-white/90">{bestCallTime}</p>
        </div>
      )}
    </div>
  );
};
