
import { Clock } from 'lucide-react';

interface TimeZoneCardProps {
  city: string;
  currentTime: string;
  suggestedTime?: string;
}

export const TimeZoneCard = ({ city, currentTime, suggestedTime }: TimeZoneCardProps) => {
  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-lg font-medium">{city}</h3>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-white/60">Current Time</p>
        <p className="text-2xl font-medium">{currentTime}</p>
        
        {suggestedTime && (
          <>
            <p className="text-sm text-white/60 mt-4">Suggested Call Time</p>
            <p className="text-lg font-medium text-white/90">{suggestedTime}</p>
          </>
        )}
      </div>
    </div>
  );
};
