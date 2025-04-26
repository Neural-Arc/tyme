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

    // Ensure default location is included
    const allCities = defaultLocation 
      ? [defaultLocation, ...cities.filter(city => city !== defaultLocation)]
      : cities;

    // Calculate time zone offsets with better DST handling
    const cityData = allCities.map(city => {
      const offset = getCityOffset(city);
      const workingHours: number[] = [];
      for (let h = 8; h <= 21; h++) {
        workingHours.push(h);
      }
      return { city, offset, workingHours };
    });

    // Handle suggested time with improved timezone awareness
    let recommendedUtcHour: number | undefined;
    
    if (suggestedTime) {
      try {
        const { hours, minutes } = parseTimeString(suggestedTime);
        
        // Improved conversion from local to UTC with proper offset handling
        recommendedUtcHour = ((hours + (minutes / 60)) - userTimeZoneOffset + 24) % 24;
        
        // Validate time for all cities with improved accuracy
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

    // Calculate best meeting time with improved accuracy
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

    // Update time zone data with accurate conversions
    setTimeZoneData(cityData.map(({ city, offset, workingHours }) => ({
      city,
      localTime: bestTime ? formatTime(convertUtcToLocal(bestTime.utcHour, offset)) : '',
      offset,
      workingHours
    })));
  }, [cities, defaultLocation, userTimeZoneOffset, suggestedTime]);

  return { timeZoneData, bestTimeRange };
};
