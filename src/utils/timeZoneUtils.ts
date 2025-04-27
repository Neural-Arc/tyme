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
  
  for (const [key, data] of Object.entries(cityTimeZones)) {
    if (lowerCity.includes(key)) {
      try {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: data.timezone,
          timeZoneName: 'longOffset'
        });
        
        const tzString = formatter.formatToParts(date)
          .find(part => part.type === 'timeZoneName')?.value || '';
        
        const match = tzString.match(/GMT([+-])(\d{2}):?(\d{2})/);
        if (match) {
          const [, sign, hours, minutes] = match;
          const offset = parseInt(hours) + (parseInt(minutes) / 60);
          return sign === '-' ? -offset : offset;
        }
      } catch (e) {
        console.warn(`Fallback to static offset for ${city}:`, e);
      }
      return data.offset;
    }
  }
  
  return -(new Date().getTimezoneOffset() / 60);
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

// Improved time conversion with better accuracy
export const convertUtcToLocal = (utcHour: number, offset: number): number => {
  const totalHours = utcHour + offset;
  return ((totalHours % 24) + 24) % 24;
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

// Convert time between cities - FIXED the logic to correctly convert between time zones
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
  
  // Fixed time conversion by correctly calculating the hour difference
  // When we go from one timezone to another, we need to ADD the difference
  // between the offsets to account for the time change
  const hoursDiff = targetCityOffset - sourceCityOffset; // FIXED: reversed the calculation
  
  // Apply the hour difference to the target date
  targetDateTime.setHours(targetDateTime.getHours() + hoursDiff);
  
  return {
    sourceDateTime,
    targetDateTime,
    sourceCityOffset,
    targetCityOffset
  };
};

// Convert hour from one time zone to another - FIXED to correctly handle fractional hours
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

// Improved calculation for best meeting time
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
  const workingHoursIntersection: number[] = [];
  
  // Find hours that work for all cities
  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const isValidForAll = cityHours.every(({ offset }) => {
      const localHour = convertUtcToLocal(utcHour, offset);
      return localHour >= 8 && localHour <= 21; // Working hours: 8 AM to 9 PM
    });
    
    if (isValidForAll) {
      workingHoursIntersection.push(utcHour);
    }
  }
  
  // Choose the most suitable hour (prioritize afternoon in default location)
  let bestUtcHour = workingHoursIntersection[Math.floor(workingHoursIntersection.length / 2)];
  if (!bestUtcHour && defaultLocation) {
    const defaultCity = cityHours.find(c => c.city === defaultLocation);
    if (defaultCity) {
      bestUtcHour = 14 - defaultCity.offset; // Aim for 2 PM in default location
    } else {
      bestUtcHour = 14; // Fallback to 2 PM UTC
    }
  }
  
  const localHour = convertUtcToLocal(bestUtcHour, userTimeZoneOffset);
  
  // Generate formatted times for all cities
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
