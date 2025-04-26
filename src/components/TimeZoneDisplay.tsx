import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TimeZoneCard } from './TimeZoneCard';
import { TimeScaleGraph } from './TimeScaleGraph';
import { useLocation } from '@/hooks/useLocation';

interface TimeZoneInfo {
  city: string;
  meetingTime: string;
  date?: string;
}

export const TimeZoneDisplay = () => {
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [specifiedDate, setSpecifiedDate] = useState<Date | undefined>(undefined);
  const [suggestedTime, setSuggestedTime] = useState<string | undefined>(undefined);
  const { defaultLocation } = useLocation();

  // Function to format current time for the default location
  const getCurrentTimeString = () => {
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date());
  };

  // Function to format current date for the default location
  const getCurrentDateString = () => {
    return format(new Date(), 'EEEE, MMMM do, yyyy');
  };

  const handleUpdateTimeZones = (event: CustomEvent) => {
    const { cities, suggestedTime, specifiedDate } = event.detail;
    
    if (cities && cities.length > 0 && suggestedTime) {
      updateTimeZones(cities, suggestedTime, specifiedDate);
      setCities(cities);
      setSpecifiedDate(specifiedDate);
      setSuggestedTime(suggestedTime);
    }
  };

  useEffect(() => {
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
    if (!suggestedTime) return;

    // Parse the suggested meeting time
    const timeRegex = /(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i;
    const timeMatch = suggestedTime.match(timeRegex);
    
    if (!timeMatch) return;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3]?.toLowerCase();
    
    // Convert to 24-hour format if AM/PM is specified
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    // Use specified date or current date
    const baseDate = userSpecifiedDate || new Date();
    
    // Set the base date to the suggested meeting time in UTC
    const utcMeetingDate = new Date(baseDate);
    utcMeetingDate.setUTCHours(hours, minutes, 0, 0);
    
    // Only add cities that were explicitly mentioned by the user
    const uniqueCities = [...new Set(cities)];
    const cityTimeZones = uniqueCities.map(city => {
      const offset = getCityOffset(city);
      
      // Calculate hours and handle partial hours like India (UTC+5.5)
      const offsetHours = Math.floor(offset);
      const offsetMinutes = (offset - offsetHours) * 60;
      
      // Create date for this city based on the meeting time
      const cityDate = new Date(utcMeetingDate);
      cityDate.setUTCHours(cityDate.getUTCHours() + offsetHours);
      cityDate.setUTCMinutes(cityDate.getUTCMinutes() + offsetMinutes);
      
      // Format meeting time without seconds
      const timeFormatter = new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric',
      });
      
      return {
        city,
        meetingTime: timeFormatter.format(cityDate),
        date: format(cityDate, 'EEEE, MMMM do, yyyy')
      };
    });
    
    setTimeZones(cityTimeZones);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Default Location Time Card - Always visible */}
      {defaultLocation && (
        <div className="mb-8">
          <h3 className="text-white/60 mb-4 text-sm">Your Location</h3>
          <TimeZoneCard
            city={defaultLocation}
            meetingTime={getCurrentTimeString()}
            date={getCurrentDateString()}
          />
        </div>
      )}

      {/* Time Cards Grid - only show user-requested city cards */}
      {timeZones.length > 0 && (
        <div>
          <h3 className="text-white/60 mb-4 text-sm">Meeting Times</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timeZones.map((tz, index) => (
              <TimeZoneCard
                key={`${tz.city}-${index}`}
                city={tz.city}
                meetingTime={tz.meetingTime}
                date={tz.date}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Time Scale Graph - Only show when there are multiple cities */}
      {cities.length > 1 && suggestedTime && (
        <TimeScaleGraph 
          cities={cities}
          specifiedDate={specifiedDate}
          suggestedTime={suggestedTime}
        />
      )}
    </div>
  );
};
