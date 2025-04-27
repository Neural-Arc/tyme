
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
      className="card-animate space-y-1" 
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      <div className="flex justify-between items-center">
        <div className="w-[160px]">
          <span className={`text-sm truncate block ${
            isCurrentLocation ? 'bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent' : 'text-white/80'
          }`}>
            {cityData.city}
            {isCurrentLocation && (
              <span className="ml-1 text-xs bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent">
                (Current)
              </span>
            )}
          </span>
          <span className="text-white/60 text-xs">
            {getTimeZoneAcronym(cityData.offset)} ({formatTimeZone(cityData.offset)})
          </span>
        </div>

        {bestTimeRange?.cityTimes[cityData.city] && (
          <div className="absolute right-2 text-xs bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent">
            {bestTimeRange.cityTimes[cityData.city]}
          </div>
        )}
      </div>

      <div className="relative h-10 ml-[180px]">
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
                  h-full transition-all duration-300
                  ${isWorkingHour ? 'bg-gradient-to-r from-[#6EE7B7]/10 via-[#3B82F6]/10 to-[#9333EA]/10' : 'bg-black/60'}
                  ${isBestTimeHour ? '!bg-gradient-to-r !from-[#6EE7B7] !via-[#3B82F6] !to-[#9333EA]' : ''}
                  border border-white/5 rounded-sm
                `}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
