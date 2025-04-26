import { toast } from "sonner";

export async function processMessage(message: string, apiKey: string): Promise<{ 
  content: string; 
  cities: string[]; 
  suggestedTime?: string; 
  specifiedDate?: Date;
  timeConversionRequest?: { sourceCity: string; time: string; };
}> {
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
          content: `You are a helpful assistant that helps find suitable meeting times across different time zones and handles time conversion requests. 
                   Always respond with the following exact format:
                   TYPE: [either "meeting" or "conversion"]
                   CITIES: [comma-separated list of cities explicitly mentioned by the user]
                   BEST_TIME: [optimal meeting time in format "HH:MM" (24-hour) or "HH:MM AM/PM" (12-hour)]
                   DATE: [date of meeting if specified, in format "YYYY-MM-DD"]
                   SOURCE_CITY: [for conversion requests, the city where the time was specified]
                   SOURCE_TIME: [for conversion requests, the specified time in format "HH:MM" or "HH:MM AM/PM"]
                   
                   For time conversion requests like "what is 3 PM Sydney time in my timezone" or "10 AM Tokyo time tomorrow",
                   use TYPE: conversion and provide SOURCE_CITY and SOURCE_TIME.
                   
                   For meeting scheduling requests, use TYPE: meeting and provide CITIES and BEST_TIME.
                   
                   Example for meeting:
                   TYPE: meeting
                   CITIES: New York, London, Tokyo
                   BEST_TIME: 14:00
                   DATE: 2025-05-01
                   
                   Example for conversion:
                   TYPE: conversion
                   CITIES: Sydney
                   SOURCE_CITY: Sydney
                   SOURCE_TIME: 10:00 AM
                   DATE: 2025-05-01`
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

    const content = data.choices[0].message.content;
    
    // Parse type
    const typeMatch = content.match(/TYPE:\s*(.*)/i);
    const type = typeMatch ? typeMatch[1].trim().toLowerCase() : 'meeting';
    
    // Parse cities and other common fields
    const citiesMatch = content.match(/CITIES:\s*(.*)/i);
    const cities = citiesMatch ? 
      citiesMatch[1].split(',').map(city => city.trim()).filter(city => city.length > 0) : 
      [];
    
    // Parse date
    const dateMatch = content.match(/DATE:\s*(.*)/i);
    let specifiedDate: Date | undefined = undefined;
    
    if (dateMatch && dateMatch[1].trim() !== "") {
      const dateStr = dateMatch[1].trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        specifiedDate = new Date(dateStr);
      }
      if (!specifiedDate || isNaN(specifiedDate.getTime())) {
        specifiedDate = parseDateFromMessage(message);
      }
    } else {
      specifiedDate = parseDateFromMessage(message);
    }

    if (type === 'conversion') {
      const sourceCityMatch = content.match(/SOURCE_CITY:\s*(.*)/i);
      const sourceTimeMatch = content.match(/SOURCE_TIME:\s*(.*)/i);
      
      if (sourceCityMatch && sourceTimeMatch) {
        return {
          content,
          cities: [],
          specifiedDate,
          timeConversionRequest: {
            sourceCity: sourceCityMatch[1].trim(),
            time: sourceTimeMatch[1].trim()
          }
        };
      }
    }

    // For meeting requests, parse suggested time
    const timeMatch = content.match(/BEST_TIME:\s*(.*)/i);
    const suggestedTime = timeMatch ? timeMatch[1].trim() : undefined;

    return { content, cities, suggestedTime, specifiedDate };
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

function parseDateFromMessage(message: string): Date | undefined {
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

  return specifiedDate;
}
