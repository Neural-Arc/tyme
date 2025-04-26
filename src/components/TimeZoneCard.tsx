
import { Clock } from 'lucide-react';

interface TimeZoneCardProps {
  city: string;
  meetingTime: string;
  date?: string;
}

export const TimeZoneCard = ({ city, meetingTime, date }: TimeZoneCardProps) => {
  return (
    <div className="glass-card p-6 transition-all duration-300 hover:bg-white/5">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-lg font-medium text-white">{city}</h3>
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-medium text-white">{meetingTime}</p>
        {date && (
          <p className="text-sm text-white/60">{date}</p>
        )}
      </div>
    </div>
  );
};
