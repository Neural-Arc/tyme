
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
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [bestCallTime, setBestCallTime] = useState<string>('');
  const [cities, setCities] = useState<string[]>([]);
  const [showDefaultCard, setShowDefaultCard] = useState<boolean>(true);

  useEffect(() => {
    // Handle updates from chat component
    const handleUpdateTimeZones = (event: CustomEvent) => {
      const { cities, suggestedTime } = event.detail;
      
      if (cities && cities.length > 0) {
        updateTimeZones(cities, suggestedTime);
        setCities(cities);
        setShowDefaultCard(false);
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
    
    // Only add cities that were explicitly mentioned by the user
    const uniqueCities = [...new Set(cities)];
    const cityTimeZones = uniqueCities.map(city => ({
      city,
      currentTime: format(currentDate, 'h:mm'),
      date: formattedDate
    }));
    
    setTimeZones(cityTimeZones);
    
    if (suggestedTime) {
      setBestCallTime(suggestedTime);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Best Call Time Card - Only show if we have a suggested time */}
      {bestCallTime && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-medium mb-2 text-white/90">Recommended Call Time</h3>
          <p className="text-2xl font-bold text-white">
            {bestCallTime}
            <span className="text-sm font-normal text-white/60 block mt-1">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </span>
          </p>
        </div>
      )}

      {/* Time Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Show default user location card only if no cities have been entered */}
        {showDefaultCard && (
          <TimeZoneCard
            key="default-location"
            city="Your Location"
            currentTime={format(new Date(), 'h:mm')}
            date={format(new Date(), 'EEEE, MMMM do, yyyy')}
          />
        )}
        
        {/* Show user-requested city cards */}
        {timeZones.map((tz, index) => (
          <TimeZoneCard
            key={`${tz.city}-${index}`}
            city={tz.city}
            currentTime={tz.currentTime}
            date={tz.date}
          />
        ))}
      </div>
      
      {/* Time Scale Graph - Only show when there are multiple cities */}
      {cities.length > 1 && (
        <TimeScaleGraph 
          cities={cities}
        />
      )}
    </div>
  );
};
