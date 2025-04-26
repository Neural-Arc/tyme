
import { Clock } from 'lucide-react';

interface TimeZoneCardProps {
  city: string;
  meetingTime: string;
  date?: string;
  timeZone?: string;
  isCurrentLocation?: boolean;
}

export const TimeZoneCard = ({ city, meetingTime, date, timeZone, isCurrentLocation }: TimeZoneCardProps) => {
  return (
    <div className={`card-animate border border-white/10 rounded-lg p-6 transition-all duration-300 ${
      isCurrentLocation ? 'border-[#F7632B]/50 bg-black/60' : 'bg-black/40 hover:bg-white/5'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <Clock className={`h-5 w-5 ${isCurrentLocation ? 'text-[#F7632B]' : 'text-white/60'}`} />
        <h3 className="text-lg font-medium text-white">
          {city}
          {isCurrentLocation && (
            <span className="ml-2 text-xs text-[#F7632B]">(Current Location)</span>
          )}
        </h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-medium ${isCurrentLocation ? 'text-[#F7632B]' : 'text-white'}`}>
            {meetingTime}
          </p>
          {timeZone && <span className="text-xs text-white/60">{timeZone}</span>}
        </div>
        {date && (
          <p className="text-sm text-white/60">{date}</p>
        )}
      </div>
    </div>
  );
};
