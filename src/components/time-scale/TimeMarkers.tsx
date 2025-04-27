
import { generateHourLabels } from '@/utils/timeZoneUtils';

interface TimeMarkersProps {
  startHour: number;
  endHour: number;
  interval: number;
}

export const TimeMarkers = ({ startHour, endHour, interval }: TimeMarkersProps) => {
  const timeMarkers = generateHourLabels(startHour, endHour, interval);

  return (
    <div className="absolute top-0 left-[160px] right-0 flex justify-between text-white/70 text-sm border-b border-white/5 pb-3">
      {timeMarkers.map(hour => {
        const isNoon = hour === 12;
        const isMidnight = hour === 0;
        
        return (
          <div key={hour} className={`text-center min-w-[36px] ${(isNoon || isMidnight) ? 'gradient-text font-medium' : ''}`}>
            {hour.toString().padStart(2, '0')}:00
            {isNoon && <div className="w-1 h-1 mx-auto mt-1 bg-gradient-to-r from-[#FFD93B] to-[#FF8A00] rounded-full"></div>}
            {isMidnight && <div className="w-1 h-1 mx-auto mt-1 bg-gradient-to-r from-[#A050F8] to-[#2AC4F2] rounded-full"></div>}
          </div>
        );
      })}
    </div>
  );
};
