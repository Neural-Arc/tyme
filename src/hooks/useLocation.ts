
import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [defaultLocation, setDefaultLocation] = useState<string>('');
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
      } catch (error) {
        console.error('Error getting location name:', error);
        setDefaultLocation('Unknown Location');
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
          setIsLoading(false);
        }
      );
    } else {
      setDefaultLocation('Unknown Location');
      setIsLoading(false);
    }
  }, []);

  return { defaultLocation, isLoading };
};
