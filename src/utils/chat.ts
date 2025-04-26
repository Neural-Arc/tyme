
import { toast } from "sonner";

export async function processMessage(message: string, apiKey: string): Promise<{ content: string; cities: string[]; suggestedTime?: string; specifiedDate?: Date }> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: `You are a helpful assistant that helps find suitable meeting times across different time zones. 
                   Always respond with the following format:
                   1. ONLY list cities that were explicitly mentioned by the user
                   2. Suggest the optimal meeting time that works well for all participants, ensuring it falls between 8:00 AM and 9:00 PM local time for each participant
                   3. Keep responses concise and focused on time zone information
                   4. Always return ONE best meeting time in the format "HH:MM" (using 24-hour format) or "HH:MM AM/PM" (using 12-hour format)
                   5. Do not include additional text like "UTC", "local time", or time zone abbreviations`
        }, {
          role: 'user',
          content: message
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to process message');
    }

    // Extract cities and suggested time from the response
    const content = data.choices[0].message.content;
    
    // Improved city extraction - specifically look for cities and not general nouns
    const cityRegex = /\b(?:(?!am|pm|time|about|currently|between|from|to|at)[A-Z][a-zA-Z\s.]{2,}(?:,\s*[A-Z][a-zA-Z\s.]{2,})*)\b/g;
    let cityMatches = content.match(cityRegex);
    let cities = cityMatches ? [...cityMatches] : [];
    
    // Clean up the extracted cities
    cities = cities.map(city => city.trim().replace(/[\s.]+$/, '').replace(/\s+/g, ' '));
    
    // Remove duplicates and non-city words from the list
    const nonCityWords = ['Best', 'Optimal', 'Meeting', 'Times', 'Suggested', 'Currently', 'Local', 'For', 'All', 'Participants'];
    cities = [...new Set(cities)].filter(city => 
      !nonCityWords.some(word => city === word) && city.length > 2 && !city.match(/^\d/) // Filter out pure numbers
    );
    
    // Improved time extraction for best call time - match both 12h and 24h formats
    const timeRegex = /(?:(?:(?:suggested|optimal|best|recommended)(?:\s+meeting)?\s+times?:?\s*)|(?:at\s+))([0-9]{1,2}:[0-9]{2}(?:\s*[AP]M)?)/i;
    const timeMatch = content.match(timeRegex);
    let suggestedTime = timeMatch ? timeMatch[1].trim() : undefined;
    
    // If we don't find a match with the specific format, look for any time format
    if (!suggestedTime) {
      const generalTimeRegex = /\b([0-9]{1,2}:[0-9]{2}(?:\s*[AP]M)?)\b/i;
      const generalTimeMatch = content.match(generalTimeRegex);
      suggestedTime = generalTimeMatch ? generalTimeMatch[1].trim() : undefined;
    }
    
    // Extract any date specified in the user's message
    const dateRegex = /(?:\b(?:on|for)\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+(\d{4}))?/i;
    const dateMatch = message.match(dateRegex);
    
    // Also look for day names
    const dayRegex = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i;
    const dayMatch = message.match(dayRegex);
    
    let specifiedDate: Date | undefined;
    
    if (dateMatch) {
      const day = dateMatch[1];
      const month = dateMatch[2];
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
      
      const monthMap: {[key: string]: number} = {
        'january': 0, 'jan': 0, 'february': 1, 'feb': 1, 'march': 2, 'mar': 2,
        'april': 3, 'apr': 3, 'may': 4, 'june': 5, 'jun': 5,
        'july': 6, 'jul': 6, 'august': 7, 'aug': 7,
        'september': 8, 'sep': 8, 'october': 9, 'oct': 9,
        'november': 10, 'nov': 10, 'december': 11, 'dec': 11
      };
      
      const monthIndex = monthMap[month.toLowerCase()];
      specifiedDate = new Date(year, monthIndex, parseInt(day));
    } else if (dayMatch) {
      const dayName = dayMatch[1].toLowerCase();
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const shortDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      
      let dayIndex = daysOfWeek.indexOf(dayName);
      if (dayIndex === -1) {
        dayIndex = shortDays.indexOf(dayName);
      }
      
      if (dayIndex !== -1) {
        const today = new Date();
        const currentDay = today.getDay();
        let daysToAdd = dayIndex - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next week if the day has already passed
        
        specifiedDate = new Date();
        specifiedDate.setDate(today.getDate() + daysToAdd);
      }
    }

    console.log("Extracted cities:", cities);
    console.log("Suggested time:", suggestedTime);
    console.log("Specified date:", specifiedDate);

    return { content, cities, suggestedTime, specifiedDate };
  } catch (error) {
    console.error('Error processing message:', error);
    toast.error('Failed to process message. Please check your API key and try again.');
    throw error;
  }
}
