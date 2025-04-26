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

// Get timezone acronym based on offset
export const getTimeZoneAcronym = (offset: number): string => {
  const timeZoneAcronyms: Record<string, string> = {
    '0': 'GMT',   // Greenwich Mean Time
    '1': 'CET',   // Central European Time
    '2': 'EET',   // Eastern European Time
    '3': 'MSK',   // Moscow Time
    '4': 'GST',   // Gulf Standard Time
    '5': 'PKT',   // Pakistan Standard Time
    '5.5': 'IST', // Indian Standard Time
    '6': 'BST',   // Bangladesh Standard Time
    '7': 'ICT',   // Indochina Time
    '8': 'CST',   // China Standard Time
    '9': 'JST',   // Japan Standard Time
    '10': 'AEST', // Australian Eastern Standard Time
    '11': 'SBT',  // Solomon Islands Time
    '12': 'NZST', // New Zealand Standard Time
    '-1': 'WAT',  // West Africa Time
    '-2': 'BRST', // Brasilia Summer Time
    '-3': 'ART',  // Argentina Time
    '-4': 'EDT',  // Eastern Daylight Time
    '-5': 'EST',  // Eastern Standard Time
    '-6': 'CST',  // Central Standard Time
    '-7': 'MST',  // Mountain Standard Time
    '-8': 'PST',  // Pacific Standard Time
    '-9': 'AKST', // Alaska Standard Time
    '-10': 'HST', // Hawaii Standard Time
    '-11': 'SST', // Samoa Standard Time
  };

  return timeZoneAcronyms[offset.toString()] || formatTimeZone(offset);
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

// Calculate best meeting time considering all cities' working hours
export const calculateBestMeetingTime = (
  cityHours: Array<{ city: string; workingHours: number[]; offset: number }>,
  defaultLocation: string,
  userTimeZoneOffset: number
): { 
  utcHour: number; 
  localHour: number; 
  formattedLocal: string;
  cityTimes: Record<string, string>;
} => {
  // Count the number of cities that have each UTC hour as a working hour
  const hourCounts = new Array(24).fill(0);
  const cityTimes: Record<string, string> = {};
  
  // Find the default location's offset
  const defaultLocationData = cityHours.find(cityData => cityData.city === defaultLocation);
  const defaultOffset = defaultLocationData ? defaultLocationData.offset : userTimeZoneOffset;
  
  // Track which hours are working hours for the default location
  const defaultLocationWorkingHours = new Set<number>();
  if (defaultLocationData) {
    defaultLocationData.workingHours.forEach(hour => {
      defaultLocationWorkingHours.add(hour);
    });
  }
  
  // Give much higher weight to the default location (3x instead of 1.5x)
  cityHours.forEach(cityData => {
    // Increase weight for current location significantly
    const weight = cityData.city === defaultLocation ? 3 : 1; 
    cityData.workingHours.forEach(hour => {
      hourCounts[hour] += weight;
    });
  });

  // Find best UTC hour with highest overlap
  let bestScore = -1;
  let bestUtcHour = 12; // Default to noon UTC if no better option
  
  for (let hour = 0; hour < 24; hour++) {
    // Only consider hours that are working hours for the default location
    if (defaultLocationData && !defaultLocationWorkingHours.has(hour)) {
      continue; // Skip this hour if it's not a working hour for default location
    }
    
    const localHour = convertUtcToLocal(hour, userTimeZoneOffset);
    // Give higher priority to user's reasonable working hours (9am-6pm)
    const isIdealUserHour = localHour >= 9 && localHour <= 18;
    const isUserWorkingHour = localHour >= 8 && localHour <= 21;
    
    let score = hourCounts[hour];
    
    // Give bonus to user's working hours
    if (isIdealUserHour) score += 2;
    else if (isUserWorkingHour) score += 1;
    
    if (score > bestScore) {
      bestScore = score;
      bestUtcHour = hour;
    }
  }

  // If no suitable time found (possibly because default location has no working hours in dataset),
  // find a reasonable hour in the default location's working hours (8 AM - 9 PM)
  if (bestScore < 0) {
    // Default to 2 PM local time for the default location if no better option found
    const defaultLocalHour = 14; // 2 PM
    bestUtcHour = (defaultLocalHour - defaultOffset) % 24;
    if (bestUtcHour < 0) bestUtcHour += 24;
  }
  
  // Convert best UTC hour to local time for user
  const localHour = convertUtcToLocal(bestUtcHour, userTimeZoneOffset);
  
  // Create formatted times for all cities
  cityHours.forEach(cityData => {
    const cityLocalHour = convertUtcToLocal(bestUtcHour, cityData.offset);
    cityTimes[cityData.city] = formatTime(cityLocalHour);
  });

  return {
    utcHour: bestUtcHour,
    localHour,
    formattedLocal: formatTime(localHour),
    cityTimes
  };
};

/**
 * Converts UTC time to local time and formats it
 * @param utcHour - Hour in UTC
 * @param cityOffset - Timezone offset for the city
 * @param includeMinutes - Whether to include minutes in the formatted time
 * @returns Formatted local time string (e.g. "3:00 PM")
 */
export const convertAndFormatTime = (utcHour: number, cityOffset: number, includeMinutes: boolean = true): string => {
  // Convert UTC hour to local hour for this city
  let localHour = convertUtcToLocal(utcHour, cityOffset);
  
  // Format the time with or without minutes
  return formatTime(localHour, includeMinutes ? 0 : undefined);
};
