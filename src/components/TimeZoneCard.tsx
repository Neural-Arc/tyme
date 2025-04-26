
import { Clock } from 'lucide-react';

interface TimeZoneCardProps {
  city: string;
  currentTime: string;
  suggestedTime?: string;
  date?: string;
}

export const TimeZoneCard = ({ city, currentTime, suggestedTime, date }: TimeZoneCardProps) => {
  return (
    <div className="glass-card p-6 animate-fade-up transition-all duration-300 hover:bg-white/5">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-lg font-medium text-white/90">{city}</h3>
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-medium text-white">{currentTime}</p>
        {date && (
          <p className="text-sm text-white/60">{date}</p>
        )}
      </div>
    </div>
  );
};
