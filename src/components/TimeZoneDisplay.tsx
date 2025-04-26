
import { useState, useEffect } from 'react';
import { TimeZoneCard } from './TimeZoneCard';
import { format } from 'date-fns';
import { TimeScaleGraph } from './TimeScaleGraph';

interface TimeZoneInfo {
  city: string;
  currentTime: string;
  suggestedTime?: string;
  date?: string;
}

export const TimeZoneDisplay = () => {
  const [localTimeZone, setLocalTimeZone] = useState<string>('');
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [bestCallTime, setBestCallTime] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('Your Location');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLocalTimeZone(local);
    
    const city = local.split('/').pop()?.replace(/_/g, ' ');
    if (city) {
      setUserLocation('Your Location');
    }
    
    // Show default time zone card for user's location
    const currentDate = new Date();
    const defaultTimeZone: TimeZoneInfo = {
      city: 'Your Location',
      currentTime: format(currentDate, 'h:mm a'),
      date: format(currentDate, 'EEEE, MMMM do, yyyy')
    };
    
    setTimeZones([defaultTimeZone]);

    const handleUpdateTimeZones = (event: CustomEvent) => {
      const { cities, suggestedTime } = event.detail;
      if (cities && cities.length > 0) {
        updateTimeZones(cities, suggestedTime);
        setCities(cities);
      }
    };

    window.addEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);

    return () => {
      window.removeEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);
    };
  }, []);

  const updateTimeZones = (cities: string[], suggestedTime?: string) => {
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'EEEE, MMMM do, yyyy');
    
    const timeZonesList: TimeZoneInfo[] = [{
      city: 'Your Location',
      currentTime: format(currentDate, 'h:mm a'),
      suggestedTime,
      date: formattedDate
    }];
    
    // Add city time zones
    const uniqueCities = [...new Set(cities)];
    const cityTimeZones = uniqueCities.map(city => ({
      city,
      currentTime: format(currentDate, 'h:mm a'),
      suggestedTime,
      date: formattedDate
    }));
    
    timeZonesList.push(...cityTimeZones);
    setTimeZones(timeZonesList);
    
    if (suggestedTime) {
      setBestCallTime(suggestedTime);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Best Call Time Card - Only show if we have a best call time */}
      {bestCallTime && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-medium mb-2">Best Time for the Call</h3>
          <p className="text-2xl font-bold">
            {bestCallTime}
            <span className="text-sm font-normal text-white/60 block mt-1">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </span>
          </p>
        </div>
      )}

      {/* Time Cards Grid - Show at least the user's location card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timeZones.map((tz, index) => (
          <TimeZoneCard
            key={`${tz.city}-${index}`}
            city={tz.city}
            currentTime={tz.currentTime}
            suggestedTime={tz.suggestedTime}
            date={tz.date}
          />
        ))}
      </div>
      
      {/* Goldilocks Zone Graph - Only show when cities are present */}
      {cities.length > 0 && (
        <TimeScaleGraph 
          cities={['Your Location', ...cities]}
        />
      )}
    </div>
  );
};
