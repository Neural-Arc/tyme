
import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [defaultLocation, setDefaultLocation] = useState<string>(() => {
    return localStorage.getItem('userLocation') || '';
  });

  const setUserLocation = (location: string) => {
    localStorage.setItem('userLocation', location);
    setDefaultLocation(location);
  };

  return { defaultLocation, setUserLocation };
};
