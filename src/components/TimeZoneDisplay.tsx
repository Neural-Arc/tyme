
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TimeZoneCard } from './TimeZoneCard';
import { TimeScaleGraph } from './TimeScaleGraph';
import { useLocation } from '@/hooks/useLocation';
import { getCityOffset, formatTimeZone, getTimeZoneAcronym, convertUtcToLocal, formatTime } from '@/utils/timeZoneUtils';

interface TimeZoneInfo {
  city: string;
  meetingTime: string;
  date?: string;
  timeZone?: string;
  timeZoneAcronym?: string;
}

export const TimeZoneDisplay = () => {
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [specifiedDate, setSpecifiedDate] = useState<Date | undefined>(undefined);
  const [suggestedTime, setSuggestedTime] = useState<string | undefined>(undefined);
  const [meetingUtcHour, setMeetingUtcHour] = useState<number | null>(null);
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
    
    if (cities && cities.length > 0) {
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
    // Use specified date or current date
    const baseDate = userSpecifiedDate || new Date();
    let utcMeetingHour: number;
    
    // Parse the suggested meeting time if provided
    if (suggestedTime) {
      const timeRegex = /(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i;
      const timeMatch = suggestedTime.match(timeRegex);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3]?.toLowerCase();
        
        // Convert to 24-hour format if AM/PM is specified
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        // Convert to UTC (for calculations)
        utcMeetingHour = hours - timeZoneOffset;
        if (utcMeetingHour < 0) utcMeetingHour += 24;
        if (utcMeetingHour >= 24) utcMeetingHour -= 24;
      } else {
        // If no valid time format, default to current hour
        utcMeetingHour = new Date().getUTCHours();
      }
    } else {
      // If no suggested time, default to current hour
      utcMeetingHour = new Date().getUTCHours();
    }
    
    setMeetingUtcHour(utcMeetingHour);
    
    // Always ensure default location is first in the list
    let uniqueCities: string[] = [];
    
    if (defaultLocation) {
      uniqueCities = [defaultLocation, ...cities.filter(city => city !== defaultLocation)];
    } else {
      uniqueCities = [...new Set(cities)];
    }
    
    const cityTimeZones = uniqueCities.filter(Boolean).map(city => {
      const offset = getCityOffset(city);
      
      // Calculate hours and handle partial hours like India (UTC+5.5)
      const offsetHours = Math.floor(offset);
      const offsetMinutes = (offset - offsetHours) * 60;
      
      // Convert UTC meeting time to this city's local time
      let cityHour = convertUtcToLocal(utcMeetingHour, offset);
      
      // Create date for this city based on the meeting time
      const cityDate = new Date(baseDate);
      cityDate.setHours(cityHour, 0, 0, 0);
      
      // Format meeting time
      const meetingTime = formatTime(cityHour);
      
      return {
        city,
        meetingTime,
        date: format(cityDate, 'EEEE, MMMM do, yyyy'),
        timeZone: formatTimeZone(offset),
        timeZoneAcronym: getTimeZoneAcronym(offset)
      };
    });
    
    setTimeZones(cityTimeZones);
    setCities(uniqueCities);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Time Scale Graph - Now shown at the top if there are any cities */}
      {cities.length > 0 && (
        <TimeScaleGraph 
          cities={cities}
          specifiedDate={specifiedDate}
          suggestedTime={suggestedTime}
          defaultLocation={defaultLocation}
        />
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
                timeZone={`${tz.timeZoneAcronym} (${tz.timeZone})`}
                isCurrentLocation={tz.city === defaultLocation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
