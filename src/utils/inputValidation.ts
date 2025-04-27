
import { countries } from 'countries-list';
import citiesList from 'cities-list';

const countryNames = Object.values(countries).map(country => country.name.toLowerCase());
const cityNames = Object.keys(citiesList).map(city => city.toLowerCase());

const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(?:am|pm)|(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/i;
const datePattern = /\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4}|\d{2})?\b|\b(tomorrow|today|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i;

export const validateInput = (input: string): boolean => {
  const words = input.toLowerCase().split(/\s+/);
  
  return words.some(word => 
    countryNames.includes(word) ||
    cityNames.includes(word) ||
    timePattern.test(word) ||
    datePattern.test(word)
  );
};

export const suggestCompletion = (input: string): string[] => {
  const lastWord = input.toLowerCase().split(/\s+/).pop() || '';
  
  if (lastWord.length < 2) return [];
  
  const suggestions = [
    ...countryNames.filter(name => name.startsWith(lastWord)),
    ...cityNames.filter(name => name.startsWith(lastWord)),
  ];
  
  return suggestions.slice(0, 5);
};
