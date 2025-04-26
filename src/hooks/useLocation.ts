
import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [defaultLocation, setDefaultLocation] = useState<string>('');
  const [timeZoneOffset, setTimeZoneOffset] = useState<number>(0);
  const [timeZoneName, setTimeZoneName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getLocationName = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        const data = await response.json();
        const city = data.city || data.locality || 'Unknown Location';
        setDefaultLocation(city);
        localStorage.setItem('userLocation', city);
        
        // Get local time zone information
        const localOffset = -(new Date().getTimezoneOffset() / 60);
        setTimeZoneOffset(localOffset);
        
        // Format time zone name like "UTC+2" or "UTC-5"
        const timeZoneSign = localOffset >= 0 ? '+' : '';
        setTimeZoneName(`UTC${timeZoneSign}${localOffset}`);
        localStorage.setItem('userTimeZone', `UTC${timeZoneSign}${localOffset}`);
      } catch (error) {
        console.error('Error getting location name:', error);
        setDefaultLocation('Unknown Location');
        
        // Still set timezone even if location fetch fails
        const localOffset = -(new Date().getTimezoneOffset() / 60);
        setTimeZoneOffset(localOffset);
        const timeZoneSign = localOffset >= 0 ? '+' : '';
        setTimeZoneName(`UTC${timeZoneSign}${localOffset}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getLocationName(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setDefaultLocation('Unknown Location');
          
          // Set timezone even if geolocation fails
          const localOffset = -(new Date().getTimezoneOffset() / 60);
          setTimeZoneOffset(localOffset);
          const timeZoneSign = localOffset >= 0 ? '+' : '';
          setTimeZoneName(`UTC${timeZoneSign}${localOffset}`);
          setIsLoading(false);
        }
      );
    } else {
      setDefaultLocation('Unknown Location');
      
      // Set timezone even if geolocation is not supported
      const localOffset = -(new Date().getTimezoneOffset() / 60);
      setTimeZoneOffset(localOffset);
      const timeZoneSign = localOffset >= 0 ? '+' : '';
      setTimeZoneName(`UTC${timeZoneSign}${localOffset}`);
      setIsLoading(false);
    }
  }, []);

  return { defaultLocation, timeZoneOffset, timeZoneName, isLoading };
};
