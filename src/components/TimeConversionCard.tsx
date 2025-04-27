import { Card } from "@/components/ui/card";
import { Clock, CloudSun, Cloud, CloudRain } from 'lucide-react';
import { getTimeZoneAcronym, formatTimeZone } from '@/utils/timeZoneUtils';

interface TimeConversionCardProps {
  city: string;
  time: Date;
  offset: number;
  isSource?: boolean;
  weather?: {
    temperature: number;
    condition: string;
  };
  newsHeadline?: string;
}

export const TimeConversionCard = ({ city, time, offset, isSource, weather, newsHeadline }: TimeConversionCardProps) => {
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('rain') || lowerCondition.includes('storm')) {
      return <CloudRain className="h-4 w-4 text-blue-400" />;
    } else if (lowerCondition.includes('cloud')) {
      return <Cloud className="h-4 w-4 text-gray-400" />;
    } else {
      return <CloudSun className="h-4 w-4 text-yellow-400" />;
    }
  };
  
  return (
    <Card className={`card-animate transition-all duration-300 transform hover:scale-105 
      ${isSource ? 
        'relative bg-black/60 before:absolute before:inset-0 before:p-[2px] before:rounded-lg before:bg-gradient-to-r before:from-[#6EE7B7] before:via-[#3B82F6] before:to-[#9333EA] before:mask-gradient-border' : 
        'bg-black/40 border border-white/10'}`}
    >
      <div className={`relative h-full w-full rounded-lg ${isSource ? 'bg-black/95' : ''} p-6`}>
        <div className="flex items-center gap-3 pb-2">
          <Clock className={`h-5 w-5 ${isSource ? 'stroke-[#6EE7B7]' : 'text-white/60'}`} style={isSource ? {
            background: 'linear-gradient(to right, #6EE7B7, #3B82F6, #9333EA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          } : {}} />
          <h3 className="text-lg font-medium text-white">
            {city}
            {isSource && <span className="ml-2 text-xs" style={{
              background: 'linear-gradient(to right, #6EE7B7, #3B82F6, #9333EA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Source Time</span>}
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-medium ${isSource ? 'bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent' : 'text-white'}`}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <span className="text-xs text-white/60">
              {getTimeZoneAcronym(offset)} ({formatTimeZone(offset)})
            </span>
          </div>
          <p className="text-sm text-white/60">
            {time.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          
          {weather && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
              {getWeatherIcon(weather.condition)}
              <span className="text-sm text-white/80">{weather.temperature}°C | {weather.condition}</span>
            </div>
          )}
          
          {newsHeadline && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs font-medium text-white/80">Business News:</p>
              <p className="text-sm text-white/90 italic">{newsHeadline}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
