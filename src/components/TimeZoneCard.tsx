
import { Clock } from 'lucide-react';

interface TimeZoneCardProps {
  city: string;
  meetingTime: string;
  date?: string;
  timeZone?: string;
}

export const TimeZoneCard = ({ city, meetingTime, date, timeZone }: TimeZoneCardProps) => {
  return (
    <div className="glass-card p-6 transition-all duration-300 hover:bg-white/5">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-lg font-medium text-white">{city}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-medium text-white">{meetingTime}</p>
          {timeZone && <span className="text-xs text-white/60">{timeZone}</span>}
        </div>
        {date && (
          <p className="text-sm text-white/60">{date}</p>
        )}
      </div>
    </div>
  );
};
