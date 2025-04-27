import { useState, useEffect } from 'react';
import { TimeZoneCard } from './TimeZoneCard';
import { TimeScaleGraph } from './TimeScaleGraph';
import { TimeConversionCard } from './TimeConversionCard';
import { useLocation } from '@/hooks/useLocation';
import { useTimeZoneCalculations } from '@/hooks/useTimeZoneCalculations';
import { formatTimeZone, getTimeZoneAcronym, convertTimeBetweenCities } from '@/utils/timeZoneUtils';
import { fetchWeatherData, fetchBusinessNews } from '@/utils/apiServices';

export const TimeZoneDisplay = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [specifiedDate, setSpecifiedDate] = useState<Date>(new Date());
  const [suggestedTime, setSuggestedTime] = useState<string | undefined>(undefined);
  const { defaultLocation, timeZoneOffset, timeZoneName, isLoading } = useLocation();

  // Add reset event listener
  useEffect(() => {
    const handleReset = () => {
      setCities([]);
      setSuggestedTime(undefined);
      setWeather({});
      setNewsHeadline(null);
    };

    window.addEventListener('resetTimeZones', handleReset);
    return () => {
      window.removeEventListener('resetTimeZones', handleReset);
    };
  }, []);

  const { timeZoneData, bestTimeRange } = useTimeZoneCalculations(
    cities,
    defaultLocation,
    timeZoneOffset,
    suggestedTime
  );

  const [timeConversion, setTimeConversion] = useState<{
    sourceCity: string;
    targetCity: string;
    sourceTime: Date;
    targetTime: Date;
    sourceCityOffset: number;
    targetCityOffset: number;
  } | null>(null);
  
  const [weather, setWeather] = useState<Record<string, { temperature: number; condition: string } | null>>({});
  const [newsHeadline, setNewsHeadline] = useState<string | null>(null);

  const resetStates = () => {
    setTimeConversion(null);
    setCities([]);
    setSuggestedTime(undefined);
    setWeather({});
    setNewsHeadline(null);
  };

  const handleUpdateTimeZones = async (event: CustomEvent) => {
    const { cities, suggestedTime, specifiedDate, timeConversionRequest } = event.detail;
    
    // Reset all states before processing new request
    resetStates();
    
    if (timeConversionRequest) {
      const { sourceCity, time } = timeConversionRequest;
      const result = convertTimeBetweenCities(
        sourceCity,
        defaultLocation,
        time,
        specifiedDate || new Date()
      );
      
      setTimeConversion({
        sourceCity,
        targetCity: defaultLocation,
        sourceTime: result.sourceDateTime,
        targetTime: result.targetDateTime,
        sourceCityOffset: result.sourceCityOffset,
        targetCityOffset: result.targetCityOffset
      });

      // Fetch weather data for source city
      const weatherData = await fetchWeatherData(sourceCity);
      if (weatherData) {
        setWeather(prev => ({ ...prev, [sourceCity]: weatherData }));
      }
      
      // Fetch business news only for single city conversion
      const news = await fetchBusinessNews(sourceCity);
      setNewsHeadline(news);
      
    } else if (cities && cities.length > 0) {
      // Limit to 4 cities
      const limitedCities = cities.slice(0, 4);
      setCities(limitedCities);
      setSpecifiedDate(specifiedDate || new Date());
      setSuggestedTime(suggestedTime);
      
      // Fetch weather data for all cities
      for (const city of limitedCities) {
        const weatherData = await fetchWeatherData(city);
        if (weatherData) {
          setWeather(prev => ({ ...prev, [city]: weatherData }));
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);
    return () => {
      window.removeEventListener('updateTimeZones', handleUpdateTimeZones as EventListener);
    };
  }, [defaultLocation]); // Add defaultLocation as dependency

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-up">
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <p className="text-white text-center">Loading your location data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 w-full px-2 md:px-4 animate-fade-up">
      {timeConversion && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <TimeConversionCard
            city={timeConversion.targetCity}
            time={timeConversion.targetTime}
            offset={timeConversion.targetCityOffset}
            isSource
            weather={weather[timeConversion.targetCity]}
          />
          <TimeConversionCard
            city={timeConversion.sourceCity}
            time={timeConversion.sourceTime}
            offset={timeConversion.sourceCityOffset}
            weather={weather[timeConversion.sourceCity]}
            newsHeadline={newsHeadline}
          />
        </div>
      )}

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
          <h3 className="text-white/60 mb-2 md:mb-4 text-sm px-2">Meeting Times</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
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
                weather={weather[tzData.city]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
