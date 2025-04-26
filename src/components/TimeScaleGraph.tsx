
import { useState, useEffect } from 'react';
import { Clock, Info } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { 
  getCityOffset, 
  formatTime, 
  convertUtcToLocal, 
  formatTimeZone,
  convertBetweenTimeZones,
  generateHourLabels,
  getTimeZoneAcronym,
  calculateBestMeetingTime
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
  const [bestTimeRange, setBestTimeRange] = useState<{
    utcHour: number; 
    localHour: number; 
    formattedLocal: string;
    cityTimes: Record<string, string>;
  } | null>(null);
  const { timeZoneOffset, timeZoneName } = useLocation();
  const baseDate = specifiedDate || new Date();
  
  const [suggestedLocalHour, setSuggestedLocalHour] = useState<number | null>(null);
  const [recommendedTime, setRecommendedTime] = useState<number | null>(null);

  const formatHour = (hour: number): string => {
    return hour.toString().padStart(2, '0');
  };

  useEffect(() => {
    if (!cities || cities.length === 0) return;
    
    // Ensure current location is first (it will later be sorted to the top in rendering)
    const allCities = defaultLocation 
      ? [defaultLocation, ...cities.filter(city => city !== defaultLocation)]
      : cities;
    
    const workingHoursData: Array<{ city: string; workingHours: number[]; offset: number }> = [];
    
    // Calculate working hours for each city
    allCities.forEach(city => {
      const offset = getCityOffset(city);
      const workingHours: number[] = [];
      
      // Calculate working hours in UTC for this city (8 AM to 9 PM local time)
      for (let h = 8; h <= 21; h++) {
        // Convert local working hour to UTC
        let utcHour = h - offset;
        if (utcHour < 0) utcHour += 24;
        if (utcHour >= 24) utcHour -= 24;
        
        workingHours.push(utcHour);
      }
      
      workingHoursData.push({ city, workingHours, offset });
    });
    
    setCityHours(workingHoursData);
    
    // Calculate best meeting time
    const bestTime = calculateBestMeetingTime(workingHoursData, defaultLocation || '', timeZoneOffset);
    setRecommendedTime(bestTime.utcHour);
    setBestTimeRange(bestTime);
    
    // Handle suggested time if provided
    if (suggestedTime) {
      const timeRegex = /(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i;
      const timeMatch = suggestedTime.match(timeRegex);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3]?.toLowerCase();
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        setSuggestedLocalHour(hours);
        
        // Convert suggested local time to UTC for consistency
        let utcHour = hours - timeZoneOffset;
        if (utcHour < 0) utcHour += 24;
        if (utcHour >= 24) utcHour -= 24;
        
        setRecommendedTime(utcHour);
        
        // Calculate all city times for this suggested time
        const cityTimes: Record<string, string> = {};
        workingHoursData.forEach(cityData => {
          const cityLocalHour = convertUtcToLocal(utcHour, cityData.offset);
          cityTimes[cityData.city] = formatTime(cityLocalHour);
        });
        
        setBestTimeRange({
          utcHour,
          localHour: hours,
          formattedLocal: formatTime(hours),
          cityTimes
        });
      }
    }
  }, [cities, suggestedTime, timeZoneOffset, defaultLocation]);

  const timeMarkers = generateHourLabels(0, 23, 3);

  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium text-white">Working Hours (08:00 - 21:00)</h3>
      </div>

      {bestTimeRange && (
        <div className="mb-6 p-4 bg-black/50 border border-[#3dd68c]/20 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">
              <span className="text-[#3dd68c] font-bold">✓ Best meeting time: </span>
              {bestTimeRange.formattedLocal} {timeZoneName}
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
        <div className="absolute top-0 left-[180px] right-0 flex justify-between text-white/60 text-sm border-b border-white/10 pb-2">
          {timeMarkers.map(hour => (
            <div key={hour} className="text-center relative" style={{ width: '50px' }}>
              <span className="absolute -left-6">{formatHour(hour)}:00</span>
            </div>
          ))}
        </div>
        
        <div className="mt-12 space-y-6">
          {cityHours
            .sort((a, b) => {
              // Always sort current location to the top
              if (a.city === defaultLocation) return -1;
              if (b.city === defaultLocation) return 1;
              return 0;
            })
            .map((cityData, index) => {
              const isCurrentLocation = cityData.city === defaultLocation;
              
              return (
                <div key={cityData.city} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="w-[160px]">
                      <span className={`text-sm truncate block ${
                        isCurrentLocation ? 'text-white font-medium' : 'text-white/80'
                      }`}>
                        {cityData.city}
                        {isCurrentLocation && (
                          <span className="ml-1 text-xs text-[#3dd68c]">(Current)</span>
                        )}
                      </span>
                      <span className="text-white/60 text-xs">
                        {getTimeZoneAcronym(cityData.offset)} ({formatTimeZone(cityData.offset)})
                      </span>
                    </div>
                    
                    {/* Local time at recommended hour */}
                    {recommendedTime !== null && bestTimeRange?.cityTimes[cityData.city] && (
                      <div className="absolute right-0 text-xs text-[#F97316] font-medium">
                        {bestTimeRange.cityTimes[cityData.city]}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative h-10 ml-[180px]">
                    {/* Local working hours background grid */}
                    <div className="absolute inset-0 grid grid-cols-24 gap-px">
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const localHour = convertUtcToLocal(hour, cityData.offset);
                        const isWorkingHour = localHour >= 8 && localHour <= 21;
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
                            <p>Recommended meeting time: {bestTimeRange?.cityTimes[cityData.city]}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {/* Working hours indicators */}
                    {cityData.workingHours.map(hour => (
                      <TooltipProvider key={`${cityData.city}-${hour}`}>
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
