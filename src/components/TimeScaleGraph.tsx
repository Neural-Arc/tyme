
import { useState, useEffect } from 'react';
import { Clock, Info } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { 
  getCityOffset, 
  formatTime, 
  convertUtcToLocal, 
  formatTimeZone,
  convertBetweenTimeZones,
  generateHourLabels
} from '@/utils/timeZoneUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeScaleGraphProps {
  cities: string[];
  specifiedDate?: Date;
  suggestedTime?: string;
  defaultLocation?: string;
}

export const TimeScaleGraph = ({ cities, specifiedDate, suggestedTime, defaultLocation }: TimeScaleGraphProps) => {
  const [cityHours, setCityHours] = useState<any[]>([]);
  const [bestTimeRange, setBestTimeRange] = useState<{start: number; end: number} | null>(null);
  const { timeZoneOffset, timeZoneName } = useLocation();
  const baseDate = specifiedDate || new Date();
  
  // Convert suggested time to local hour if available
  const [suggestedLocalHour, setSuggestedLocalHour] = useState<number | null>(null);

  const formatHour = (hour: number): string => {
    return hour.toString().padStart(2, '0');
  };

  // Get time markers for the scale - every 3 hours, in 24-hour format
  // Removed the first timeMarkers declaration

  useEffect(() => {
    if (!cities || cities.length === 0) return;
    
    const workingHoursData: any[] = [];
    
    cities.forEach(city => {
      const offset = getCityOffset(city);
      const workingHours: number[] = [];
      
      // Calculate working hours in UTC for this city (8 AM to 9 PM local time)
      for (let h = 8; h <= 21; h++) {
        // Convert local hour to UTC hour
        let utcHour = (h - offset) % 24;
        if (utcHour < 0) utcHour += 24;
        workingHours.push(utcHour);
      }
      
      workingHoursData.push({ city, workingHours, offset });
    });
    
    setCityHours(workingHoursData);
    
    // Find overlapping hours with preference to user's local time zone
    if (workingHoursData.length > 0) {
      const hourCounts = new Array(24).fill(0);
      
      workingHoursData.forEach(cityData => {
        cityData.workingHours.forEach(hour => {
          hourCounts[hour]++;
        });
      });
      
      // Find the hours where most cities overlap
      const allCitiesCount = workingHoursData.length;
      let bestOverlapCount = 0;
      let bestHours: number[] = [];
      
      for (let hour = 0; hour < 24; hour++) {
        // Convert UTC hour to user's local hour
        const localHour = convertUtcToLocal(hour, timeZoneOffset);
        
        // Prioritize hours during user's working day (8am-9pm)
        const isUserWorkingHour = localHour >= 8 && localHour <= 21;
        
        // Weight the score - give preference to user's working hours
        let score = hourCounts[hour];
        if (isUserWorkingHour) score += 0.5;
        
        if (score > bestOverlapCount) {
          bestOverlapCount = score;
          bestHours = [hour];
        } else if (score === bestOverlapCount && bestOverlapCount > 0) {
          bestHours.push(hour);
        }
      }
      
      // Find the longest consecutive best hour range
      if (bestHours.length > 0) {
        bestHours.sort((a, b) => a - b);
        let currentStart = bestHours[0];
        let currentEnd = bestHours[0];
        let maxStart = currentStart;
        let maxEnd = currentEnd;
        let maxLength = 1;
        let currentLength = 1;
        
        for (let i = 1; i < bestHours.length; i++) {
          if (bestHours[i] === bestHours[i-1] + 1) {
            // Consecutive hour
            currentEnd = bestHours[i];
            currentLength++;
            
            if (currentLength > maxLength) {
              maxLength = currentLength;
              maxStart = currentStart;
              maxEnd = currentEnd;
            }
          } else {
            // Not consecutive, start a new sequence
            currentStart = bestHours[i];
            currentEnd = bestHours[i];
            currentLength = 1;
          }
        }
        
        setBestTimeRange({ start: maxStart, end: maxEnd });
      } else {
        setBestTimeRange(null);
      }
    }
    
    // If we have a suggested time, highlight it on the graph
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
        
        // Convert to UTC
        let utcHour = hours - timeZoneOffset;
        if (utcHour < 0) utcHour += 24;
        if (utcHour >= 24) utcHour -= 24;
        
        setSuggestedLocalHour(hours);
        
        // Highlight this time on the graph
        setBestTimeRange({ start: utcHour, end: utcHour });
      }
    }
  }, [cities, suggestedTime, timeZoneOffset]);

  // Convert bestTimeRange UTC hours to local hours for display
  const getLocalBestTimeRange = () => {
    if (!bestTimeRange) return null;
    
    const localStart = convertUtcToLocal(bestTimeRange.start, timeZoneOffset);
    let localEnd = convertUtcToLocal(bestTimeRange.end, timeZoneOffset);
    
    // Add 1 to end time for display since we show ranges as inclusive-exclusive
    localEnd = (localEnd + 1) % 24;
    
    return {
      start: localStart,
      end: localEnd,
      startFormatted: formatTime(localStart),
      endFormatted: formatTime(localEnd)
    };
  };

  const localBestTimeRange = getLocalBestTimeRange();
  
  // Get time markers for the scale - every 3 hours
  // Use the generateHourLabels function to create time markers
  const timeMarkers = generateHourLabels(0, 23, 3);

  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium text-white">Working Hours (08:00 - 21:00)</h3>
      </div>

      {/* Best time range callout */}
      {localBestTimeRange && (
        <div className="mb-6 p-4 bg-black/50 border border-[#3dd68c]/20 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">
              <span className="text-[#3dd68c] font-bold">✓ Best meeting time: </span>
              {localBestTimeRange.startFormatted} - {localBestTimeRange.endFormatted} {timeZoneName}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Info className="h-4 w-4 text-white/60" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black/90 border border-white/10 text-white">
                  <p>Times shown in your local time zone ({timeZoneName})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      
      <div className="relative h-[340px]">
        {/* Time scale - Now with better spacing and 24-hour format */}
        <div className="absolute top-0 left-[140px] right-0 flex justify-between text-white/60 text-sm border-b border-white/10 pb-2">
          {timeMarkers.map(hour => (
            <div key={hour} className="text-center relative" style={{ width: '40px' }}>
              <span className="absolute -left-5">{formatHour(hour)}:00</span>
            </div>
          ))}
        </div>
        
        {/* City working hours bars - Now with fixed width for city names */}
        <div className="mt-12 space-y-6">
          {cityHours.map((cityData, index) => {
            const isCurrentLocation = cityData.city === defaultLocation;
            const order = isCurrentLocation ? -1 : index;
            
            return (
              <div key={cityData.city} className="space-y-1" style={{ order }}>
                <div className="flex justify-between">
                  <span className="text-white/80 text-sm w-[120px] truncate">
                    {cityData.city}
                  </span>
                  <span className="text-white/60 text-xs">
                    {formatTimeZone(cityData.offset)}
                  </span>
                </div>
                
                <div className="relative h-10 ml-[140px]">
                  <div className="absolute inset-0 grid grid-cols-24 gap-px">
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const isWorkingHour = hour >= 8 && hour <= 21;
                      return (
                        <div
                          key={hour}
                          className={`h-full ${
                            isWorkingHour ? 'bg-[#3dd68c]/30 border-[#3dd68c]/50' : 'bg-white/10 border-white/20'
                          } border rounded-sm`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Highlight working hours */}
                  {cityData.workingHours.map(hour => (
                    <TooltipProvider key={hour}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-0 bottom-0 bg-[#3dd68c]/30 border border-[#3dd68c]/50 rounded-sm transition-all duration-300"
                            style={{
                              left: `${(hour / 24) * 100}%`,
                              width: `${(1 / 24) * 100}%`
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black/90 border border-white/10 text-white">
                          <p>{formatTime(convertUtcToLocal(hour, cityData.offset))} {cityData.city} local time</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-white/60 flex justify-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>All times shown in your local time zone ({timeZoneName})</span>
        </div>
      </div>
    </div>
  );
};
