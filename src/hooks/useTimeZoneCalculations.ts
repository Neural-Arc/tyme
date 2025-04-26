
import { useState, useEffect } from 'react';
import { 
  getCityOffset,
  convertUtcToLocal,
  formatTime,
  calculateBestMeetingTime,
  isTimeWithinWorkingHours,
  parseTimeString
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

    // Calculate accurate time zone offsets for each city
    const cityData = allCities.map(city => {
      const offset = getCityOffset(city);
      
      // Calculate working hours in each city's local time
      // Standard working hours: 8 AM - 9 PM (8-21)
      const workingHours: number[] = [];
      for (let h = 8; h <= 21; h++) {
        workingHours.push(h);
      }
      
      return { city, offset, workingHours };
    });

    // Handle suggested time if provided
    let recommendedUtcHour: number | undefined;
    
    if (suggestedTime) {
      try {
        // Parse the suggested time
        const { hours, minutes } = parseTimeString(suggestedTime);
        
        // Convert suggested local time to UTC
        // We need to go from local time -> UTC
        recommendedUtcHour = (hours - userTimeZoneOffset + 24) % 24;
        if (minutes > 0) {
          recommendedUtcHour += minutes / 60;
        }
        
        // Only use recommended time if it's within working hours for all cities
        const isValidForAllCities = cityData.every(({ offset }) => {
          const cityLocalHour = convertUtcToLocal(recommendedUtcHour!, offset);
          return isTimeWithinWorkingHours(cityLocalHour);
        });

        if (!isValidForAllCities) {
          recommendedUtcHour = undefined;
        }
      } catch (e) {
        console.error("Error parsing suggested time:", e);
        recommendedUtcHour = undefined;
      }
    }

    // Calculate best meeting time (using recommended time if valid, otherwise find optimal)
    const bestTime = recommendedUtcHour !== undefined
      ? {
          utcHour: recommendedUtcHour,
          localHour: convertUtcToLocal(recommendedUtcHour, userTimeZoneOffset),
          formattedLocal: formatTime(convertUtcToLocal(recommendedUtcHour, userTimeZoneOffset)),
          cityTimes: Object.fromEntries(
            cityData.map(({ city, offset }) => [
              city, 
              formatTime(convertUtcToLocal(recommendedUtcHour, offset))
            ])
          )
        }
      : calculateBestMeetingTime(cityData, defaultLocation, userTimeZoneOffset);
    
    setBestTimeRange(bestTime);

    // Set time zone data with the calculated best time
    setTimeZoneData(cityData.map(({ city, offset, workingHours }) => ({
      city,
      localTime: bestTime ? formatTime(convertUtcToLocal(bestTime.utcHour, offset)) : '',
      offset,
      workingHours
    })));
  }, [cities, defaultLocation, userTimeZoneOffset, suggestedTime]);

  return { timeZoneData, bestTimeRange };
};
