
import { useState, useEffect } from 'react';
import { TimeZoneCard } from './TimeZoneCard';
import { format } from 'date-fns';
import { TimeScaleGraph } from './TimeScaleGraph';
import { DatePicker } from './ui/date-picker';

interface TimeZoneInfo {
  city: string;
  currentTime: string;
  suggestedTime?: string;
  date?: string;
}

export const TimeZoneDisplay = () => {
  const [localTimeZone, setLocalTimeZone] = useState<string>('');
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [bestCallTime, setBestCallTime] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('Your Location');
  const [cities, setCities] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLocalTimeZone(local);
    
    const city = local.split('/').pop()?.replace(/_/g, ' ');
    if (city) {
      setUserLocation('Your Location');
    }
    
    updateTimeZones([], undefined, selectedDate);

    const handleUpdateTimeZones = (event: CustomEvent) => {
      const { cities, suggestedTime } = event.detail;
      updateTimeZones(cities, suggestedTime, selectedDate);
      setCities(cities);
    };

    window.addEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);

    return () => {
      window.removeEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);
    };
  }, [selectedDate]);

  const updateTimeZones = (cities: string[], suggestedTime?: string, date: Date = new Date()) => {
    const formattedDate = format(date, 'EEEE, MMMM do, yyyy');
    const userLocTimeZone = {
      city: 'Your Location',
      currentTime: format(date, 'h:mm a'),
      suggestedTime,
      date: formattedDate
    };
    
    const uniqueCities = [...new Set(cities)];
    const cityTimeZones = uniqueCities.map(city => ({
      city,
      currentTime: format(date, 'h:mm a'),
      suggestedTime,
      date: formattedDate
    }));
    
    setTimeZones([userLocTimeZone, ...cityTimeZones]);
    
    if (suggestedTime) {
      setBestCallTime(suggestedTime);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Date Picker */}
      <div className="flex justify-end">
        <DatePicker 
          date={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
        />
      </div>

      {/* Best Call Time Card */}
      {bestCallTime && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-medium text-black mb-2">Best Time for the Call</h3>
          <p className="text-2xl font-bold text-black">
            {bestCallTime}
            <span className="text-sm font-normal text-gray-600 block mt-1">
              {format(selectedDate, 'EEEE, MMMM do, yyyy')}
            </span>
          </p>
        </div>
      )}

      {/* Time Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timeZones.map((tz, index) => (
          <TimeZoneCard
            key={`${tz.city}-${index}`}
            city={tz.city}
            currentTime={tz.currentTime}
            suggestedTime={tz.suggestedTime}
            date={tz.date}
          />
        ))}
      </div>
      
      {/* Goldilocks Zone Graph */}
      {cities.length > 0 && (
        <TimeScaleGraph 
          cities={['Your Location', ...cities]}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};
