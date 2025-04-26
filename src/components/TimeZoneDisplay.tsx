
import { useState, useEffect } from 'react';
import { TimeZoneCard } from './TimeZoneCard';
import { TimeScaleGraph } from './TimeScaleGraph';
import { useLocation } from '@/hooks/useLocation';
import { useTimeZoneCalculations } from '@/hooks/useTimeZoneCalculations';
import { formatTimeZone, getTimeZoneAcronym } from '@/utils/timeZoneUtils';

export const TimeZoneDisplay = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [specifiedDate, setSpecifiedDate] = useState<Date>(new Date());
  const [suggestedTime, setSuggestedTime] = useState<string | undefined>(undefined);
  const { defaultLocation, timeZoneOffset, timeZoneName, isLoading } = useLocation();

  const { timeZoneData, bestTimeRange } = useTimeZoneCalculations(
    cities,
    defaultLocation,
    timeZoneOffset,
    suggestedTime
  );

  const handleUpdateTimeZones = (event: CustomEvent) => {
    const { cities, suggestedTime, specifiedDate } = event.detail;
    
    if (cities && cities.length > 0) {
      setCities(cities);
      setSpecifiedDate(specifiedDate || new Date());
      setSuggestedTime(suggestedTime);
    }
  };

  useEffect(() => {
    window.addEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);
    return () => {
      window.removeEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-up">
      {cities.length > 0 && (
        <TimeScaleGraph 
          timeZoneData={timeZoneData}
          bestTimeRange={bestTimeRange}
          defaultLocation={defaultLocation}
          timeZoneName={timeZoneName}
          currentDate={specifiedDate}
        />
      )}

      {timeZoneData.length > 0 && (
        <div>
          <h3 className="text-white/60 mb-4 text-sm">Meeting Times</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timeZoneData.map((tzData, index) => (
              <TimeZoneCard
                key={`${tzData.city}-${index}`}
                city={tzData.city}
                meetingTime={bestTimeRange?.cityTimes[tzData.city] || ''}
                date={specifiedDate?.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                timeZone={`${getTimeZoneAcronym(tzData.offset)} (${formatTimeZone(tzData.offset)})`}
                isCurrentLocation={tzData.city === defaultLocation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
