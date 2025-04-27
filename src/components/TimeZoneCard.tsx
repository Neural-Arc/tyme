
import { Clock, CloudSun, Cloud, CloudRain } from 'lucide-react';

interface TimeZoneCardProps {
  city: string;
  meetingTime: string;
  date?: string;
  timeZone?: string;
  isCurrentLocation?: boolean;
  weather?: {
    temperature: number;
    condition: string;
  };
  newsHeadline?: string;
}

export const TimeZoneCard = ({
  city,
  meetingTime,
  date,
  timeZone,
  isCurrentLocation,
  weather,
  newsHeadline
}: TimeZoneCardProps) => {
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

  return <div className={`card-animate relative ${isCurrentLocation ? 'p-[1px] bg-gradient-to-r from-[#FFD93B] via-[#FF4E9B] to-[#2AC4F2]' : 'border border-white/10'} rounded-lg transition-all duration-300 transform hover:scale-105`}>
    <div className={`${isCurrentLocation ? 'bg-black' : 'bg-black/40'} rounded-lg p-4 h-full`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 gradient-icon" />
        <h3 className={`text-sm font-medium ${isCurrentLocation ? 'bg-gradient-to-r from-[#FFD93B] via-[#FF4E9B] to-[#2AC4F2] bg-clip-text text-transparent' : 'text-white'}`}>
          {city}
          {isCurrentLocation && (
            <span className="ml-1 text-xs bg-gradient-to-r from-[#FFD93B] via-[#FF4E9B] to-[#2AC4F2] bg-clip-text text-transparent">
              (Current)
            </span>
          )}
        </h3>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <p className="text-lg text-white font-medium">{meetingTime}</p>
          {timeZone && <span className="text-xs text-white/60">{timeZone}</span>}
        </div>
        {date && <p className="text-xs text-white/60">{date}</p>}
        
        {weather && <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
          {getWeatherIcon(weather.condition)}
          <span className="text-xs text-white/80">{weather.temperature}°C | {weather.condition}</span>
        </div>}
        
        {newsHeadline && <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-xs font-medium text-white/80">Business News:</p>
          <p className="text-xs text-white/90 italic">{newsHeadline}</p>
        </div>}
      </div>
    </div>
  </div>;
};
