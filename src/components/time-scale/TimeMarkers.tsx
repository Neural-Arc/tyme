
import { generateHourLabels } from '@/utils/timeZoneUtils';

interface TimeMarkersProps {
  startHour: number;
  endHour: number;
  interval: number;
}

export const TimeMarkers = ({ startHour, endHour, interval }: TimeMarkersProps) => {
  const timeMarkers = generateHourLabels(startHour, endHour, interval);

  return (
    <div className="absolute top-0 left-[180px] right-0 flex justify-between text-white/70 text-sm border-b border-white/10 pb-2">
      {timeMarkers.map(hour => (
        <div key={hour} className="text-center min-w-[36px]">
          {hour.toString().padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
};
