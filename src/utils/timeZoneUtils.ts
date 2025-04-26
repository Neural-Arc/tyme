// Map cities to their approximate UTC offsets and time zones
export const getCityOffset = (city: string): number => {
  const cityTimeZones: Record<string, {offset: number, timezone: string}> = {
    'london': {offset: 0, timezone: 'Europe/London'},
    'new york': {offset: -5, timezone: 'America/New_York'},
    'los angeles': {offset: -8, timezone: 'America/Los_Angeles'},
    'san francisco': {offset: -8, timezone: 'America/Los_Angeles'},
    'tokyo': {offset: 9, timezone: 'Asia/Tokyo'},
    'sydney': {offset: 10, timezone: 'Australia/Sydney'},
    'melbourne': {offset: 10, timezone: 'Australia/Melbourne'},
    'paris': {offset: 1, timezone: 'Europe/Paris'},
    'berlin': {offset: 1, timezone: 'Europe/Berlin'},
    'dubai': {offset: 4, timezone: 'Asia/Dubai'},
    'singapore': {offset: 8, timezone: 'Asia/Singapore'},
    'hong kong': {offset: 8, timezone: 'Asia/Hong_Kong'},
    'beijing': {offset: 8, timezone: 'Asia/Shanghai'},
    'mumbai': {offset: 5.5, timezone: 'Asia/Kolkata'},
    'delhi': {offset: 5.5, timezone: 'Asia/Kolkata'},
    'toronto': {offset: -5, timezone: 'America/Toronto'},
    'rio': {offset: -3, timezone: 'America/Sao_Paulo'},
    'sao paulo': {offset: -3, timezone: 'America/Sao_Paulo'},
    'cape town': {offset: 2, timezone: 'Africa/Johannesburg'},
    'mexico city': {offset: -6, timezone: 'America/Mexico_City'},
  };
  
  const lowerCity = city.toLowerCase();
  
  // Try to find the city in our dictionary
  for (const [key, data] of Object.entries(cityTimeZones)) {
    if (lowerCity.includes(key)) {
      // Try to get the current offset using Intl API for more accuracy (handles DST)
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: data.timezone,
          timeZoneName: 'shortOffset'
        });
        
        // Extract the UTC offset from the formatted string
        const tzString = formatter.format(new Date());
        const match = tzString.match(/UTC([+-]\d+)(?::(\d+))?/);
        
        if (match) {
          const hours = parseInt(match[1], 10);
          const minutes = match[2] ? parseInt(match[2], 10) / 60 : 0;
          return hours >= 0 ? hours + minutes : hours - minutes;
        }
      } catch (e) {
        console.log(`Could not determine accurate timezone for ${city}, using default offset.`);
      }
      
      // Fall back to hardcoded offset if Intl API fails
      return data.offset;
    }
  }
  
  // For unknown cities, try to make an educated guess using the browser's timezone
  console.log(`Unknown city: ${city}, using default timezone offset.`);
  const localOffset = -(new Date().getTimezoneOffset() / 60);
  return localOffset;
};

// Format time in 12-hour format with AM/PM
export const formatTime = (hour: number): string => {
  // Ensure hour is between 0 and 24
  hour = ((hour % 24) + 24) % 24;
  
  const wholeHour = Math.floor(hour);
  const minutes = Math.round((hour - wholeHour) * 60);
  
  // Convert to 12-hour format
  const period = wholeHour < 12 ? 'AM' : 'PM';
  const displayHour = wholeHour % 12 || 12;
  
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Convert UTC hour to local hour based on offset
export const convertUtcToLocal = (utcHour: number, offset: number): number => {
  let localHour = utcHour + offset;
  if (localHour >= 24) localHour -= 24;
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

// New function to parse time string
export const parseTimeString = (timeStr: string): { hours: number; minutes: number; period?: string } => {
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = timeStr.match(timeRegex);
  
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3]?.toLowerCase();
    
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    return { hours, minutes, period };
  }
  
  throw new Error('Invalid time format');
};

// Convert time between cities
export const convertTimeBetweenCities = (
  sourceCity: string,
  targetCity: string,
  sourceTime: string,
  sourceDate: Date
): {
  sourceDateTime: Date;
  targetDateTime: Date;
  sourceCityOffset: number;
  targetCityOffset: number;
} => {
  const sourceCityOffset = getCityOffset(sourceCity);
  const targetCityOffset = getCityOffset(targetCity);
  
  const { hours, minutes } = parseTimeString(sourceTime);
  
  // Create date object for source time
  const sourceDateTime = new Date(sourceDate);
  sourceDateTime.setHours(hours, minutes, 0, 0);
  
  // Calculate target time considering the offset difference
  const targetDateTime = new Date(sourceDateTime);
  const hoursDiff = sourceCityOffset - targetCityOffset; // Corrected offset calculation
  targetDateTime.setHours(targetDateTime.getHours() + hoursDiff);
  
  return {
    sourceDateTime,
    targetDateTime,
    sourceCityOffset,
    targetCityOffset
  };
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

// New utility function to check if a time is within working hours (8 AM - 9 PM)
export const isTimeWithinWorkingHours = (localHour: number): boolean => {
  return localHour >= 8 && localHour <= 21;
};

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
  const bestHours: number[] = [];
  
  // Try each UTC hour (0-23) and check if it results in valid working hours for all cities
  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const isValidHour = cityHours.every(({ offset }) => {
      const cityLocalHour = convertUtcToLocal(utcHour, offset);
      return isTimeWithinWorkingHours(cityLocalHour);
    });

    if (isValidHour) {
      bestHours.push(utcHour);
    }
  }

  // If no valid hours found, prioritize default location's working hours
  if (bestHours.length === 0) {
    console.warn('No perfect overlapping working hours found for all cities');
    const defaultCity = cityHours.find(c => c.city === defaultLocation);
    if (defaultCity) {
      const defaultOffset = defaultCity.offset;
      // Convert default location's 2 PM (14:00) to UTC as a reasonable fallback
      const defaultLocalHour = 14;
      const utcHour = (defaultLocalHour - defaultOffset + 24) % 24;
      bestHours.push(utcHour);
    } else {
      bestHours.push(12); // Default to noon UTC if no better option
    }
  }

  // Choose the best hour (prioritize middle of the day)
  const bestUtcHour = bestHours[Math.floor(bestHours.length / 2)];
  const localHour = convertUtcToLocal(bestUtcHour, userTimeZoneOffset);

  // Generate times for all cities
  const cityTimes: Record<string, string> = {};
  cityHours.forEach(({ city, offset }) => {
    const cityLocalHour = convertUtcToLocal(bestUtcHour, offset);
    cityTimes[city] = formatTime(cityLocalHour);
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
 * @returns Formatted local time string (e.g. "3:00 PM")
 */
export const convertAndFormatTime = (utcHour: number, cityOffset: number): string => {
  const localHour = convertUtcToLocal(utcHour, cityOffset);
  return formatTime(localHour);
};
