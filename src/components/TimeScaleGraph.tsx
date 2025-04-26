
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeScaleGraphProps {
  cities: string[];
  specifiedDate?: Date;
  suggestedTime?: string;
}

interface CityWorkingHours {
  city: string;
  workingHours: number[];
}

export const TimeScaleGraph = ({ cities, specifiedDate, suggestedTime }: TimeScaleGraphProps) => {
  const [cityHours, setCityHours] = useState<CityWorkingHours[]>([]);
  const [bestTimeRange, setBestTimeRange] = useState<{start: number; end: number} | null>(null);
  const baseDate = specifiedDate || new Date();

  // Map cities to their approximate UTC offsets
  const getCityOffset = (city: string): number => {
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
    
    // Default offset for unknown cities
    return Math.floor(Math.random() * 24) - 12;
  };

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
      
      workingHoursData.push({ city, workingHours });
    });
    
    setCityHours(workingHoursData);
    
    // Find overlapping hours
    if (workingHoursData.length > 1) {
      const hourCounts = new Array(24).fill(0);
      
      workingHoursData.forEach(cityData => {
        cityData.workingHours.forEach(hour => {
          hourCounts[hour]++;
        });
      });
      
      // Find the hours where all cities overlap
      const allCitiesCount = workingHoursData.length;
      let bestOverlapCount = 0;
      let bestHours: number[] = [];
      
      for (let hour = 0; hour < 24; hour++) {
        if (hourCounts[hour] > bestOverlapCount) {
          bestOverlapCount = hourCounts[hour];
          bestHours = [hour];
        } else if (hourCounts[hour] === bestOverlapCount && bestOverlapCount > 0) {
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
      const timeRegex = /(\d{1,2}):(\d{2})\s*(am|pm)?/i;
      const timeMatch = suggestedTime.match(timeRegex);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3]?.toLowerCase();
        
        // Convert to 24-hour format if AM/PM is specified
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        // Highlight this time on the graph
        setBestTimeRange({ start: hours, end: hours });
      }
    }
  }, [cities, suggestedTime]);

  const formatHour = (hour: number): string => {
    return hour === 0 ? '24' : `${hour}`;
  };

  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium text-white">Working Hours Overlap (8:00 - 21:00)</h3>
      </div>
      
      {/* Best time range callout - Moved above the graph */}
      {bestTimeRange && (
        <div className="mb-6 p-4 bg-black/50 border border-[#3dd68c]/20 rounded-lg transition-all duration-300">
          <p className="text-lg font-medium">
            <span className="text-[#3dd68c] font-bold">✓ Best meeting window: </span>
            {formatHour(bestTimeRange.start)}:00 - {formatHour(bestTimeRange.end + 1)}:00
          </p>
          <p className="text-sm text-white/60 mt-2">
            This time range works best for all {cities.length} {cities.length === 1 ? 'location' : 'locations'}, 
            keeping everyone within their 8:00 - 21:00 working hours.
          </p>
        </div>
      )}
      
      <div className="relative h-[280px] w-full">
        {/* Time scale */}
        <div className="absolute top-0 left-0 right-0 flex justify-between text-white/60 text-sm border-b border-white/10 pb-1">
          {[0, 6, 12, 18, 23].map(hour => (
            <div key={hour} className="text-center">{formatHour(hour)}</div>
          ))}
        </div>
        
        {/* City working hours bars */}
        <div className="mt-8 space-y-6">
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
                    8:00 - 21:00 local time
                  </span>
                </div>
                
                <div className="relative h-8 w-full bg-white/5 rounded">
                  <div className="absolute inset-0 grid grid-cols-24 gap-px">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div key={hour} className="h-full"></div>
                    ))}
                  </div>
                  
                  {cityData.workingHours.map(hour => {
                    const isInBestTimeRange = 
                      bestTimeRange && (hour >= bestTimeRange.start && hour <= bestTimeRange.end);
                    
                    return (
                      <div 
                        key={hour} 
                        className={`absolute top-0 bottom-0 border ${
                          isInBestTimeRange 
                            ? 'bg-[#3dd68c]/30 border-[#3dd68c]/50' 
                            : colors[colorIndex]
                        } rounded-sm transition-all duration-300`}
                        style={{
                          left: `${(hour / 24) * 100}%`, 
                          width: `${(1 / 24) * 100}%`
                        }}
                      ></div>
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
            className="absolute top-8 h-[calc(100%-32px)] bg-[#3dd68c]/10 border-l border-r border-[#3dd68c]/20 transition-all duration-300 pointer-events-none"
            style={{
              left: `${(bestTimeRange.start / 24) * 100}%`,
              width: `${((bestTimeRange.end - bestTimeRange.start + 1) / 24) * 100}%`
            }}
          ></div>
        )}
      </div>
    </div>
  );
};
