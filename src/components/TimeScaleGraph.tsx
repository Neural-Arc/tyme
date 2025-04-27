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
      <div className="bg-black/40 border border-white/10 rounded-xl p-6 animate-fade-up">
        <p className="text-white text-center">Please select 4 or fewer cities for optimal display.</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5" style={{
          stroke: 'url(#gradientStroke)'
        }} />
        <h3 className="text-xl font-medium text-white">Working Hours (08:00 - 21:00)</h3>
      </div>

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
                <stop offset="0%" style={{ stopColor: '#6EE7B7' }} />
                <stop offset="50%" style={{ stopColor: '#3B82F6' }} />
                <stop offset="100%" style={{ stopColor: '#9333EA' }} />
              </linearGradient>
            </defs>
          </svg>

          <TimeMarkers startHour={0} endHour={23} interval={3} />

          <div className="mt-12 space-y-6">
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

      <div className="mt-4 text-xs text-white/60 flex justify-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ stroke: 'url(#gradientStroke)' }} />
          <span>All times shown in your local time zone ({timeZoneName})</span>
        </div>
      </div>
    </div>
  );
};
