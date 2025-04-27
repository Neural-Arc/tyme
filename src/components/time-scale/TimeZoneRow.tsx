
import { getTimeZoneAcronym, formatTimeZone } from '@/utils/timeZoneUtils';

interface TimeZoneRowProps {
  cityData: {
    city: string;
    workingHours: number[];
    offset: number;
  };
  bestTimeRange: {
    utcHour: number;
    cityTimes: Record<string, string>;
  } | null;
  isCurrentLocation: boolean;
  index: number;
}

export const TimeZoneRow = ({ cityData, bestTimeRange, isCurrentLocation, index }: TimeZoneRowProps) => {
  return (
    <div 
      className="card-animate space-y-2" 
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      <div className="flex justify-between items-center">
        <div className="w-[160px]">
          <span className={`text-sm truncate block ${
            isCurrentLocation ? 'gradient-text font-medium' : 'text-white/90'
          }`}>
            {cityData.city}
            {isCurrentLocation && (
              <span className="ml-1 text-xs gradient-text">
                (Current)
              </span>
            )}
          </span>
          <span className="text-white/60 text-xs">
            {getTimeZoneAcronym(cityData.offset)} ({formatTimeZone(cityData.offset)})
          </span>
        </div>

        {bestTimeRange?.cityTimes[cityData.city] && (
          <div className="absolute right-2 text-xs gradient-text font-medium">
            {bestTimeRange.cityTimes[cityData.city]}
          </div>
        )}
      </div>

      <div className="relative h-10 ml-[160px]">
        <div className="absolute inset-0 grid grid-cols-24 gap-px">
          {Array.from({ length: 24 }).map((_, hour) => {
            const isWorkingHour = cityData.workingHours.includes(hour);
            const cityLocalHour = bestTimeRange?.utcHour !== undefined ? 
              ((hour + cityData.offset + 24) % 24) : hour;
            const isBestTimeHour = bestTimeRange && hour === cityLocalHour;
            
            return (
              <div
                key={hour}
                className={`
                  h-full rounded-md transition-all duration-300
                  ${isWorkingHour ? 'bg-white/5 backdrop-blur-sm' : 'bg-black/60'}
                  ${isBestTimeHour ? 'best-time-cell' : ''}
                  border border-white/5
                `}
              >
                {isBestTimeHour && (
                  <div className="absolute inset-0 best-time-glow opacity-50"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
