import { Clock } from 'lucide-react';
import { TimeMarkers } from './time-scale/TimeMarkers';
import { BestTimeHeader } from './time-scale/BestTimeHeader';
import { TimeZoneRow } from './time-scale/TimeZoneRow';

interface TimeScaleGraphProps {
  timeZoneData: {
    city: string;
    localTime: string;
    offset: number;
    workingHours: number[];
  }[];
  bestTimeRange: {
    utcHour: number;
    localHour: number;
    formattedLocal: string;
    cityTimes: Record<string, string>;
  } | null;
  defaultLocation?: string;
  timeZoneName: string;
  currentDate: Date;
}

export const TimeScaleGraph = ({
  timeZoneData,
  bestTimeRange,
  defaultLocation,
  timeZoneName,
  currentDate
}: TimeScaleGraphProps) => {
  if (timeZoneData.length > 4) {
    return (
      <div className="glass-card p-6 animate-fade-up">
        <p className="text-white text-center">Please select 4 or fewer cities for optimal display.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-up backdrop-blur-md">
      {bestTimeRange && defaultLocation && (
        <BestTimeHeader 
          bestTimeRange={bestTimeRange}
          currentDate={currentDate}
          timeZoneName={timeZoneName}
        />
      )}

      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          <svg width="0" height="0">
            <defs>
              <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD93B" />
                <stop offset="25%" stopColor="#FF8A00" />
                <stop offset="50%" stopColor="#FF4E9B" />
                <stop offset="75%" stopColor="#A050F8" />
                <stop offset="100%" stopColor="#2AC4F2" />
              </linearGradient>
            </defs>
          </svg>

          <TimeMarkers startHour={0} endHour={23} interval={3} />

          <div className="mt-14">
            {timeZoneData.length > 0 && (
              <h3 className="text-white/60 mb-4 text-sm">Meeting Times</h3>
            )}
            <div className="space-y-6">
              {timeZoneData.sort((a, b) => {
                if (a.city === defaultLocation) return -1;
                if (b.city === defaultLocation) return 1;
                return a.city.localeCompare(b.city);
              }).map((cityData, index) => (
                <TimeZoneRow
                  key={cityData.city}
                  cityData={cityData}
                  bestTimeRange={bestTimeRange}
                  isCurrentLocation={cityData.city === defaultLocation}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-white/60 flex justify-center">
        <span>All times shown in your local time zone ({timeZoneName})</span>
      </div>
    </div>
  );
};
