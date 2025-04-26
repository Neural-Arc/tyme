import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TimeZoneCard } from './TimeZoneCard';
import { TimeScaleGraph } from './TimeScaleGraph';
import { useLocation } from '@/hooks/useLocation';
import { getCityOffset, formatTimeZone } from '@/utils/timeZoneUtils';

interface TimeZoneInfo {
  city: string;
  meetingTime: string;
  date?: string;
  timeZone?: string;
}

export const TimeZoneDisplay = () => {
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [specifiedDate, setSpecifiedDate] = useState<Date | undefined>(undefined);
  const [suggestedTime, setSuggestedTime] = useState<string | undefined>(undefined);
  const { defaultLocation, timeZoneOffset, timeZoneName, isLoading } = useLocation();

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
    
    // Set the base date to the suggested meeting time in the user's local time zone
    const meetingDate = new Date(baseDate);
    meetingDate.setHours(hours, minutes, 0, 0);
    
    // Convert to UTC (for calculations)
    const utcMeetingHour = (hours - timeZoneOffset) % 24;
    
    // Only add cities that were explicitly mentioned by the user
    const uniqueCities = [...new Set(cities)];
    const cityTimeZones = uniqueCities.map(city => {
      const offset = getCityOffset(city);
      
      // Calculate hours and handle partial hours like India (UTC+5.5)
      const offsetHours = Math.floor(offset);
      const offsetMinutes = (offset - offsetHours) * 60;
      
      // Convert UTC meeting time to this city's local time
      let cityHour = (utcMeetingHour + offset) % 24;
      if (cityHour < 0) cityHour += 24;
      
      // Create date for this city based on the meeting time
      const cityDate = new Date(baseDate);
      cityDate.setHours(cityHour, minutes, 0, 0);
      
      // Format meeting time without seconds
      const timeFormatter = new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric',
      });
      
      return {
        city,
        meetingTime: timeFormatter.format(cityDate),
        date: format(cityDate, 'EEEE, MMMM do, yyyy'),
        timeZone: formatTimeZone(offset)
      };
    });
    
    setTimeZones(cityTimeZones);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Default Location Time Card - Always visible */}
      {defaultLocation && !isLoading && (
        <div className="mb-8">
          <h3 className="text-white/60 mb-4 text-sm">Current Location</h3>
          <TimeZoneCard
            city={defaultLocation}
            meetingTime={getCurrentTimeString()}
            date={getCurrentDateString()}
            timeZone={timeZoneName}
          />
        </div>
      )}

      {/* Meeting Times Section */}
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
                timeZone={tz.timeZone}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Time Scale Graph */}
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
