
import { Clock, Info } from 'lucide-react';
import { 
  formatTime,
  formatTimeZone,
  generateHourLabels,
  getTimeZoneAcronym,
  convertUtcToLocal,
} from '@/utils/timeZoneUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
}

export const TimeScaleGraph = ({ 
  timeZoneData,
  bestTimeRange,
  defaultLocation,
  timeZoneName
}: TimeScaleGraphProps) => {
  // Use intervals of 3 hours for time markers
  const timeMarkers = generateHourLabels(0, 23, 3);
  const formatHour = (hour: number): string => hour.toString().padStart(2, '0');

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium text-white">Working Hours (08:00 - 21:00)</h3>
      </div>

      {bestTimeRange && defaultLocation && (
        <div className="mb-6 p-4 bg-black/50 border border-[#3dd68c]/20 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">
              <span className="text-[#3dd68c] font-bold">✓ Best meeting time: </span>
              {bestTimeRange.formattedLocal} {defaultLocation}
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

      <div className="relative overflow-x-auto">
        <div className="min-w-[800px] h-auto">
          {/* Time markers on top */}
          <div className="absolute top-0 left-[180px] right-0 flex justify-between text-white/60 text-sm border-b border-white/10 pb-2">
            {timeMarkers.map(hour => (
              <div key={hour} className="text-center min-w-[36px]">
                {formatHour(hour)}:00
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-6">
            {timeZoneData
              .sort((a, b) => {
                if (a.city === defaultLocation) return -1;
                if (b.city === defaultLocation) return 1;
                return a.city.localeCompare(b.city);
              })
              .map((cityData) => {
                const isCurrentLocation = cityData.city === defaultLocation;

                return (
                  <div key={cityData.city} className="space-y-1">
                    <div className="flex justify-between items-center">
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

                      {bestTimeRange?.cityTimes[cityData.city] && (
                        <div className="absolute right-2 text-xs text-[#F97316] font-medium">
                          {bestTimeRange.cityTimes[cityData.city]}
                        </div>
                      )}
                    </div>

                    <div className="relative h-10 ml-[180px]">
                      <div className="absolute inset-0 grid grid-cols-24 gap-px">
                        {Array.from({ length: 24 }).map((_, hour) => {
                          const isWorkingHour = cityData.workingHours.includes(hour);
                          return (
                            <div
                              key={hour}
                              className={`h-full ${
                                isWorkingHour ? 'bg-[#3dd68c]/20 border-[#3dd68c]/20' : 'bg-black/40 border-white/10'
                              } border rounded-sm`}
                            />
                          );
                        })}

                        {bestTimeRange && (
                          <div
                            className="absolute top-0 bottom-0 bg-[#F97316] border border-[#F97316] rounded-sm transition-all duration-300"
                            style={{
                              left: `${((bestTimeRange.localHour % 24) / 24) * 100}%`,
                              width: `${(1 / 24) * 100}%`,
                              zIndex: 10
                            }}
                          />
                        )}
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
          <Clock className="h-4 w-4" />
          <span>All times shown in your local time zone ({timeZoneName})</span>
        </div>
      </div>
    </div>
  );
};
