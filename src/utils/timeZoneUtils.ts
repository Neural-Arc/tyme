
// Map cities to their approximate UTC offsets
export const getCityOffset = (city: string): number => {
  const cityOffsets: Record<string, number> = {
    'london': 0,
    'new york': -5, 
    'los angeles': -8,
    'san francisco': -8,
    'tokyo': 9,
    'sydney': 10,
    'melbourne': 10,
    'paris': 1,
    'berlin': 1,
    'dubai': 4,
    'singapore': 8,
    'hong kong': 8,
    'beijing': 8,
    'mumbai': 5.5,
    'delhi': 5.5,
    'toronto': -5,
    'rio': -3,
    'sao paulo': -3,
    'cape town': 2,
    'mexico city': -6,
  };
  
  const lowerCity = city.toLowerCase();
  
  for (const [key, offset] of Object.entries(cityOffsets)) {
    if (lowerCity.includes(key)) {
      return offset;
    }
  }
  
  // Default offset for unknown cities
  return Math.floor(Math.random() * 24) - 12;
};

// Format time in 12-hour format with AM/PM
export const formatTime = (hour: number, minute: number = 0): string => {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

// Convert UTC hour to local hour based on offset
export const convertUtcToLocal = (utcHour: number, offset: number): number => {
  let localHour = (utcHour + offset) % 24;
  if (localHour < 0) localHour += 24;
  return localHour;
};

// Format time zone name based on offset
export const formatTimeZone = (offset: number): string => {
  const sign = offset >= 0 ? '+' : '';
  return `UTC${sign}${offset}`;
};

// Convert hour from one time zone to another
export const convertBetweenTimeZones = (hour: number, fromOffset: number, toOffset: number): number => {
  // First convert to UTC
  let utcHour = hour - fromOffset;
  // Then convert from UTC to target time zone
  let targetHour = utcHour + toOffset;
  
  // Handle day wrap
  if (targetHour >= 24) targetHour -= 24;
  if (targetHour < 0) targetHour += 24;
  
  return targetHour;
};

// Generate hour labels for the time scale
export const generateHourLabels = (startHour: number, endHour: number, interval: number = 6): number[] => {
  const hours = [];
  for (let hour = startHour; hour <= endHour; hour += interval) {
    hours.push(hour % 24);
  }
  return hours;
};
