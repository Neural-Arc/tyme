
import { useState, useEffect } from 'react';
import { TimeZoneCard } from './TimeZoneCard';
import { format } from 'date-fns';
import { Card } from './ui/card';
import { MapPin } from 'lucide-react';
import { TimeScaleGraph } from './TimeScaleGraph';

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
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    // Get local timezone
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLocalTimeZone(local);
    
    // Try to get user's city name from timezone
    const city = local.split('/').pop()?.replace(/_/g, ' ');
    setUserLocation(city || 'Local Time');
    
    // Set initial local time card
    setTimeZones([{
      city: 'Your Location',
      currentTime: format(new Date(), 'h:mm a, EEEE, MMMM do, yyyy'),
    }]);

    // Listen for updateTimeZones events
    const handleUpdateTimeZones = (event: CustomEvent) => {
      const { cities, suggestedTime } = event.detail;
      updateTimeZones(cities, suggestedTime);
      setCities(cities);
    };

    window.addEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);

    return () => {
      window.removeEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);
    };
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
      
      {/* Goldilocks Zone Graph */}
      {cities.length > 0 && (
        <TimeScaleGraph cities={cities} />
      )}
      
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
