import { Clock, Info } from 'lucide-react';
import { 
  formatTime, 
  formatTimeZone, 
  generateHourLabels, 
  getTimeZoneAcronym, 
  convertUtcToLocal 
} from '@/utils/timeZoneUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MeetingInviteDialog } from './MeetingInviteDialog';

interface TimeScaleGraphProps {
  timeZoneData: {
    city: string;
    localTime: string;
    offset: number;
    workingHours: number[];
  }[];
  bestTimeRange: {
    utcHour: number;
    localHour: number;
    formattedLocal: string;
    cityTimes: Record<string, string>;
  } | null;
  defaultLocation?: string;
  timeZoneName: string;
  currentDate: Date;
}

export const TimeScaleGraph = ({
  timeZoneData,
  bestTimeRange,
  defaultLocation,
  timeZoneName,
  currentDate
}: TimeScaleGraphProps) => {
  const timeMarkers = generateHourLabels(0, 23, 3);

  if (timeZoneData.length > 4) {
    return (
      <div className="bg-black/40 border border-blue-400/20 rounded-xl p-6 animate-fade-up">
        <p className="text-white text-center">Please select 4 or fewer cities for optimal display.</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" />
        <h3 className="text-xl font-medium text-white">Working Hours (08:00 - 21:00)</h3>
      </div>

      {bestTimeRange && defaultLocation && (
        <div className="mb-6 p-4 bg-black/50 border border-white/10 rounded-lg">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium">
                <span className="font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Best meeting time:</span>
                <br />
                <span>{bestTimeRange.formattedLocal}</span>
                <br />
                <span className="text-white/60">
                  {currentDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MeetingInviteDialog 
                meetingTime={bestTimeRange.formattedLocal} 
                date={currentDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} 
              />
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
        </div>
      )}

      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="absolute top-0 left-[180px] right-0 flex justify-between text-white/70 text-sm border-b border-blue-400/20 pb-2">
            {timeMarkers.map(hour => (
              <div key={hour} className="text-center min-w-[36px]">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-6">
            {timeZoneData.sort((a, b) => {
              if (a.city === defaultLocation) return -1;
              if (b.city === defaultLocation) return 1;
              return a.city.localeCompare(b.city);
            }).map((cityData, index) => {
              const isCurrentLocation = cityData.city === defaultLocation;
              return (
                <div 
                  key={cityData.city} 
                  className="card-animate space-y-1" 
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="w-[160px]">
                      <span className={`text-sm truncate block ${
                        isCurrentLocation ? 'text-blue-400 font-medium' : 'text-white/80'
                      }`}>
                        {cityData.city}
                        {isCurrentLocation && (
                          <span className="ml-1 text-xs text-blue-400">(Current)</span>
                        )}
                      </span>
                      <span className="text-white/60 text-xs">
                        {getTimeZoneAcronym(cityData.offset)} ({formatTimeZone(cityData.offset)})
                      </span>
                    </div>

                    {bestTimeRange?.cityTimes[cityData.city] && (
                      <div className="absolute right-2 text-xs text-blue-400 font-medium">
                        {bestTimeRange.cityTimes[cityData.city]}
                      </div>
                    )}
                  </div>

                  <div className="relative h-10 ml-[180px]">
                    <div className="absolute inset-0 grid grid-cols-24 gap-px">
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const isWorkingHour = cityData.workingHours.includes(hour);
                        const cityLocalHour = convertUtcToLocal(bestTimeRange?.utcHour || 0, cityData.offset);
                        const isBestTimeHour = bestTimeRange && hour === cityLocalHour;
                        
                        return (
                          <div
                            key={hour}
                            className={`
                              h-full transition-all duration-300
                              ${isWorkingHour ? 'bg-blue-900/10 hover:bg-blue-900/20' : 'bg-black/60'}
                              ${isBestTimeHour ? 'timeline-highlight !bg-blue-400/90 hover:!bg-blue-400' : ''}
                              border rounded-sm
                              ${isWorkingHour ? 'border-blue-900/20' : 'border-white/5'}
                            `}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-white/60 flex justify-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" />
          <span>All times shown in your local time zone ({timeZoneName})</span>
        </div>
      </div>
    </div>
  );
};
