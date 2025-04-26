
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
}

interface CityWorkingHours {
  city: string;
  workingHours: number[];
  offset: number;
}

export const TimeScaleGraph = ({ cities, specifiedDate, suggestedTime }: TimeScaleGraphProps) => {
  const [cityHours, setCityHours] = useState<CityWorkingHours[]>([]);
  const [bestTimeRange, setBestTimeRange] = useState<{start: number; end: number} | null>(null);
  const { timeZoneOffset, timeZoneName } = useLocation();
  const baseDate = specifiedDate || new Date();
  
  // Convert suggested time to local hour if available
  const [suggestedLocalHour, setSuggestedLocalHour] = useState<number | null>(null);

  useEffect(() => {
    if (!cities || cities.length === 0) return;
    
    const workingHoursData: CityWorkingHours[] = [];
    
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

  const formatHour = (hour: number): string => {
    return hour === 0 ? '24' : `${hour}`;
  };

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
  const timeMarkers = generateHourLabels(0, 23, 3);

  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium text-white">Working Hours Overlap (8:00 - 21:00)</h3>
      </div>

      {/* Best time range callout - Above the graph */}
      {localBestTimeRange && (
        <div className="mb-6 p-4 bg-black/50 border border-[#3dd68c]/20 rounded-lg transition-all duration-300">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">
              <span className="text-[#3dd68c] font-bold">✓ Best meeting window: </span>
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
          <p className="text-sm text-white/60 mt-2">
            This time range works best for all {cities.length} {cities.length === 1 ? 'location' : 'locations'}, 
            keeping everyone within their 8:00 - 21:00 working hours.
          </p>
        </div>
      )}
      
      <div className="relative h-[340px] w-full">
        {/* Time scale */}
        <div className="absolute top-0 left-0 right-0 flex justify-between text-white/60 text-sm border-b border-white/10 pb-1">
          {timeMarkers.map(hour => {
            // Convert UTC hour to local hour for display
            const localHour = convertUtcToLocal(hour, timeZoneOffset);
            return (
              <div key={hour} className="text-center">
                {formatTime(localHour).split(' ')[0]}
                <span className="text-xs block">{formatTime(localHour).split(' ')[1]}</span>
              </div>
            );
          })}
        </div>
        
        {/* City working hours bars */}
        <div className="mt-12 space-y-8">
          {cityHours.map((cityData, index) => {
            const colorIndex = index % 5;
            const colors = [
              'bg-white/25 border-white/40',
              'bg-white/20 border-white/30',
              'bg-white/15 border-white/25',
              'bg-white/10 border-white/20',
              'bg-white/5 border-white/15'
            ];
            
            return (
              <div key={cityData.city} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/80 text-sm">{cityData.city}</span>
                  <span className="text-white/60 text-xs">
                    8:00 - 21:00 {formatTimeZone(cityData.offset)}
                  </span>
                </div>
                
                <div className="relative h-10 w-full bg-white/5 rounded">
                  <div className="absolute inset-0 grid grid-cols-24 gap-px">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div key={hour} className="h-full"></div>
                    ))}
                  </div>
                  
                  {cityData.workingHours.map(hour => {
                    const isInBestTimeRange = 
                      bestTimeRange && (hour >= bestTimeRange.start && hour <= bestTimeRange.end);
                    
                    // Convert UTC hour to city's local hour for tooltip
                    const cityLocalHour = convertUtcToLocal(hour, cityData.offset);
                    
                    return (
                      <TooltipProvider key={hour}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`absolute top-0 bottom-0 border ${
                                isInBestTimeRange 
                                  ? 'bg-[#3dd68c]/30 border-[#3dd68c]/50' 
                                  : colors[colorIndex]
                              } rounded-sm transition-all duration-300 cursor-default`}
                              style={{
                                left: `${(hour / 24) * 100}%`, 
                                width: `${(1 / 24) * 100}%`
                              }}
                            >
                              {isInBestTimeRange && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-[#3dd68c]">
                                  {formatTime(cityLocalHour)}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-black/90 border border-white/10 text-white">
                            <p>{formatTime(cityLocalHour)} {cityData.city} local time</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Goldilocks zone overlay */}
        {bestTimeRange && (
          <div 
            className="absolute top-12 h-[calc(100%-48px)] bg-[#3dd68c]/10 border-l border-r border-[#3dd68c]/20 transition-all duration-300 pointer-events-none"
            style={{
              left: `${(bestTimeRange.start / 24) * 100}%`,
              width: `${((bestTimeRange.end - bestTimeRange.start + 1) / 24) * 100}%`
            }}
          ></div>
        )}
      </div>
      
      {/* Time zone legend */}
      <div className="mt-4 text-xs text-white/60 flex justify-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>All times shown in your local time zone ({timeZoneName})</span>
        </div>
      </div>
    </div>
  );
};
