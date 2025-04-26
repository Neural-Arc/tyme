
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
  const [bestTimeRange, setBestTimeRange] = useState<{start: number; end: number; localStart: number; localEnd: number} | null>(null);
  const { timeZoneOffset, timeZoneName } = useLocation();
  const baseDate = specifiedDate || new Date();
  
  const [suggestedLocalHour, setSuggestedLocalHour] = useState<number | null>(null);
  const [recommendedTime, setRecommendedTime] = useState<number | null>(null);

  const formatHour = (hour: number): string => {
    return hour.toString().padStart(2, '0');
  };

  useEffect(() => {
    if (!cities || cities.length === 0) return;
    
    // Sort cities to ensure current location is first
    const sortedCities = [...cities].sort((a, b) => {
      if (a === defaultLocation) return -1;
      if (b === defaultLocation) return 1;
      return 0;
    });
    
    const workingHoursData: any[] = [];
    let totalHours = 0;
    let hoursCount = 0;
    
    sortedCities.forEach(city => {
      const offset = getCityOffset(city);
      const workingHours: number[] = [];
      
      // Calculate working hours in UTC for this city (8 AM to 9 PM local time)
      for (let h = 8; h <= 21; h++) {
        let utcHour = (h - offset) % 24;
        if (utcHour < 0) utcHour += 24;
        workingHours.push(utcHour);
        
        // Add to median calculation
        totalHours += utcHour;
        hoursCount++;
      }
      
      workingHoursData.push({ city, workingHours, offset });
    });
    
    // Calculate median time for recommendation
    const recommendedHour = Math.round(totalHours / hoursCount) % 24;
    setRecommendedTime(recommendedHour);
    
    setCityHours(workingHoursData);
    
    // Find overlapping hours with preference to current location
    if (workingHoursData.length > 0) {
      const hourCounts = new Array(24).fill(0);
      
      workingHoursData.forEach((cityData, index) => {
        const weight = cityData.city === defaultLocation ? 1.5 : 1; // Give more weight to current location
        cityData.workingHours.forEach(hour => {
          hourCounts[hour] += weight;
        });
      });
      
      // Find best hours
      let bestOverlapCount = 0;
      let bestHours: number[] = [];
      
      for (let hour = 0; hour < 24; hour++) {
        const localHour = convertUtcToLocal(hour, timeZoneOffset);
        const isUserWorkingHour = localHour >= 8 && localHour <= 21;
        let score = hourCounts[hour];
        if (isUserWorkingHour) score += 0.5;
        
        if (score > bestOverlapCount) {
          bestOverlapCount = score;
          bestHours = [hour];
        } else if (score === bestOverlapCount && bestOverlapCount > 0) {
          bestHours.push(hour);
        }
      }
      
      // Find longest consecutive range
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
            currentEnd = bestHours[i];
            currentLength++;
            
            if (currentLength > maxLength) {
              maxLength = currentLength;
              maxStart = currentStart;
              maxEnd = currentEnd;
            }
          } else {
            currentStart = bestHours[i];
            currentEnd = bestHours[i];
            currentLength = 1;
          }
        }
        
        const localStart = convertUtcToLocal(maxStart, timeZoneOffset);
        const localEnd = convertUtcToLocal(maxEnd, timeZoneOffset);
        setBestTimeRange({ 
          start: maxStart, 
          end: maxEnd,
          localStart,
          localEnd
        });
      } else {
        setBestTimeRange(null);
      }
    }
    
    // Handle suggested time
    if (suggestedTime) {
      const timeRegex = /(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i;
      const timeMatch = suggestedTime.match(timeRegex);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3]?.toLowerCase();
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        let utcHour = hours - timeZoneOffset;
        if (utcHour < 0) utcHour += 24;
        if (utcHour >= 24) utcHour -= 24;
        
        setSuggestedLocalHour(hours);
        setBestTimeRange({ 
          start: utcHour, 
          end: utcHour,
          localStart: hours,
          localEnd: hours
        });
      }
    }
  }, [cities, suggestedTime, timeZoneOffset, defaultLocation]);

  const getLocalBestTimeRange = () => {
    if (!bestTimeRange) return null;
    
    return {
      start: bestTimeRange.localStart,
      end: bestTimeRange.localEnd,
      startFormatted: formatTime(bestTimeRange.localStart),
      endFormatted: formatTime((bestTimeRange.localEnd + 1) % 24)
    };
  };

  const localBestTimeRange = getLocalBestTimeRange();
  const timeMarkers = generateHourLabels(0, 23, 3);

  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium text-white">Working Hours (08:00 - 21:00)</h3>
      </div>

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
        <div className="absolute top-0 left-[160px] right-0 flex justify-between text-white/60 text-sm border-b border-white/10 pb-2">
          {timeMarkers.map(hour => (
            <div key={hour} className="text-center relative" style={{ width: '45px' }}>
              <span className="absolute -left-4">{formatHour(hour)}:00</span>
            </div>
          ))}
        </div>
        
        <div className="mt-12 space-y-6">
          {cityHours.map((cityData, index) => {
            const isCurrentLocation = cityData.city === defaultLocation;
            
            return (
              <div key={cityData.city} className="space-y-1">
                <div className="flex justify-between">
                  <span className={`text-sm w-[140px] truncate ${
                    isCurrentLocation ? 'text-white font-medium' : 'text-white/80'
                  }`}>
                    {cityData.city}
                    {isCurrentLocation && (
                      <span className="ml-1 text-xs text-[#3dd68c]">(Current)</span>
                    )}
                  </span>
                  <span className="text-white/60 text-xs">
                    {formatTimeZone(cityData.offset)}
                  </span>
                </div>
                
                <div className="relative h-10 ml-[160px]">
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
                  
                  {/* Recommended time indicator */}
                  {recommendedTime !== null && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-0 bottom-0 bg-[#F97316]/30 border border-[#F97316]/50 rounded-sm"
                            style={{
                              left: `${(recommendedTime / 24) * 100}%`,
                              width: `${(1 / 24) * 100}%`,
                              zIndex: 10
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black/90 border border-white/10 text-white">
                          <p>Recommended meeting time</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {/* Working hours indicators */}
                  {cityData.workingHours.map(hour => (
                    <TooltipProvider key={hour}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-0 bottom-0 bg-[#3dd68c]/30 border border-[#3dd68c]/50 rounded-sm"
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
