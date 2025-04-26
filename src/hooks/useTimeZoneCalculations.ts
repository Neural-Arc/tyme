
import { useState, useEffect } from 'react';
import { 
  getCityOffset,
  convertUtcToLocal,
  formatTime,
  calculateBestMeetingTime
} from '@/utils/timeZoneUtils';

interface TimeZoneData {
  city: string;
  localTime: string;
  offset: number;
  workingHours: number[];
}

export const useTimeZoneCalculations = (
  cities: string[],
  defaultLocation: string,
  userTimeZoneOffset: number,
  suggestedTime?: string
) => {
  const [timeZoneData, setTimeZoneData] = useState<TimeZoneData[]>([]);
  const [bestTimeRange, setBestTimeRange] = useState<{
    utcHour: number;
    localHour: number;
    formattedLocal: string;
    cityTimes: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    if (!cities.length) return;

    // Always ensure default location is included if provided
    const allCities = defaultLocation 
      ? [defaultLocation, ...cities.filter(city => city !== defaultLocation)]
      : cities;

    // Calculate working hours and offsets for each city
    const workingHoursData = allCities.map(city => {
      const offset = getCityOffset(city);
      const workingHours: number[] = [];
      
      // Calculate working hours in UTC (8 AM to 9 PM local time)
      for (let h = 8; h <= 21; h++) {
        let utcHour = h - offset;
        if (utcHour < 0) utcHour += 24;
        if (utcHour >= 24) utcHour -= 24;
        workingHours.push(utcHour);
      }

      return { city, workingHours, offset };
    });

    // Handle suggested time if provided
    let recommendedTime: number | undefined;
    if (suggestedTime) {
      const timeRegex = /(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i;
      const timeMatch = suggestedTime.match(timeRegex);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const period = timeMatch[3]?.toLowerCase();
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        // Convert suggested local time to UTC
        let utcHour = hours - userTimeZoneOffset;
        if (utcHour < 0) utcHour += 24;
        if (utcHour >= 24) utcHour -= 24;
        
        recommendedTime = utcHour;
      }
    }

    // Calculate best meeting time
    const bestTime = recommendedTime !== undefined 
      ? {
          utcHour: recommendedTime,
          localHour: convertUtcToLocal(recommendedTime, userTimeZoneOffset),
          formattedLocal: formatTime(convertUtcToLocal(recommendedTime, userTimeZoneOffset)),
          cityTimes: Object.fromEntries(
            workingHoursData.map(({ city, offset }) => [
              city,
              formatTime(convertUtcToLocal(recommendedTime, offset))
            ])
          )
        }
      : calculateBestMeetingTime(workingHoursData, defaultLocation, userTimeZoneOffset);

    setBestTimeRange(bestTime);

    // Set time zone data for all cities
    setTimeZoneData(workingHoursData.map(({ city, offset, workingHours }) => ({
      city,
      localTime: bestTime ? bestTime.cityTimes[city] : '',
      offset,
      workingHours
    })));
  }, [cities, defaultLocation, userTimeZoneOffset, suggestedTime]);

  return { timeZoneData, bestTimeRange };
};
