
import { useState, useEffect } from 'react';
import { format, addHours, addMinutes } from 'date-fns';
import { TimeZoneCard } from './TimeZoneCard';
import { TimeScaleGraph } from './TimeScaleGraph';

interface TimeZoneInfo {
  city: string;
  currentTime: string;
  date?: string;
}

export const TimeZoneDisplay = () => {
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [bestCallTime, setBestCallTime] = useState<string>('');
  const [cities, setCities] = useState<string[]>([]);
  const [showDefaultCard, setShowDefaultCard] = useState<boolean>(true);
  const [specifiedDate, setSpecifiedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Handle updates from chat component
    const handleUpdateTimeZones = (event: CustomEvent) => {
      const { cities, suggestedTime, specifiedDate } = event.detail;
      
      if (cities && cities.length > 0) {
        updateTimeZones(cities, suggestedTime, specifiedDate);
        setCities(cities);
        setSpecifiedDate(specifiedDate);
        setShowDefaultCard(false);
      }
    };

    window.addEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);

    return () => {
      window.removeEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);
    };
  }, []);

  const getCityOffset = (city: string): number => {
    // Map cities to their approximate UTC offsets
    const cityOffsets: Record<string, number> = {
      'london': 0,
      'new york': -5,
      'los angeles': -8,
      'san francisco': -8,
      'tokyo': 9,
      'sydney': 10,
      'melbourne': 10,
      'paris': 1,
      'berlin': 1,
      'dubai': 4,
      'singapore': 8,
      'hong kong': 8,
      'beijing': 8,
      'mumbai': 5.5,
      'delhi': 5.5,
      'toronto': -5,
      'rio': -3,
      'sao paulo': -3,
      'cape town': 2,
      'mexico city': -6,
    };
    
    const lowerCity = city.toLowerCase();
    
    for (const [key, offset] of Object.entries(cityOffsets)) {
      if (lowerCity.includes(key)) {
        return offset;
      }
    }
    
    // Default to random offset for demo purposes
    return Math.floor(Math.random() * 24) - 12;
  };

  const updateTimeZones = (cities: string[], suggestedTime?: string, userSpecifiedDate?: Date) => {
    const baseDate = userSpecifiedDate || new Date();
    const baseUtcHours = baseDate.getUTCHours();
    const baseUtcMinutes = baseDate.getUTCMinutes();
    
    // Only add cities that were explicitly mentioned by the user
    const uniqueCities = [...new Set(cities)];
    const cityTimeZones = uniqueCities.map(city => {
      const offset = getCityOffset(city);
      
      // Calculate hours and handle partial hours like India (UTC+5.5)
      const hours = Math.floor(offset);
      const minutes = (offset - hours) * 60;
      
      // Create date for this city based on UTC offset
      const cityDate = new Date(baseDate);
      cityDate.setUTCHours(baseUtcHours + hours);
      cityDate.setUTCMinutes(baseUtcMinutes + minutes);
      
      return {
        city,
        currentTime: format(cityDate, 'h:mm a'),
        date: format(cityDate, 'EEEE, MMMM do, yyyy')
      };
    });
    
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
              {specifiedDate ? format(specifiedDate, 'EEEE, MMMM do, yyyy') : format(new Date(), 'EEEE, MMMM do, yyyy')}
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
            currentTime={format(new Date(), 'h:mm a')}
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
          specifiedDate={specifiedDate}
        />
      )}
    </div>
  );
};
