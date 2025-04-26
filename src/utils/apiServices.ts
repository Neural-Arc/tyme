
// Fetch weather information for a city
export const fetchWeatherData = async (city: string): Promise<{ temperature: number; condition: string } | null> => {
  try {
    // This would normally use a real API like OpenWeatherMap
    // For demo purposes, we'll return mock data based on the city name
    const cityHash = [...city.toLowerCase()].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const weatherConditions = [
      'Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 
      'Thunderstorms', 'Clear Skies', 'Overcast', 'Foggy', 'Windy'
    ];
    
    const condition = weatherConditions[cityHash % weatherConditions.length];
    const temperature = Math.floor(10 + (cityHash % 25)); // Temperature between 10-35°C
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { temperature, condition };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

// Fetch business news for a city
export const fetchBusinessNews = async (city: string): Promise<string | null> => {
  try {
    // This would normally use a real API like NewsAPI
    // For demo purposes, we'll return mock headlines based on the city name
    const headlines = [
      `${city} Tech Startups Raise Record Funding in 2025`,
      `New Business District Planned for Downtown ${city}`,
      `${city}'s Largest Company Announces Expansion`,
      `Economic Growth in ${city} Surpasses National Average`,
      `${city} Hosts International Business Conference`,
      `Tech Giants Opening New Offices in ${city}`,
      `${city}'s Stock Exchange Reports Record Trading Volume`,
      `Business Leaders in ${city} Push for Sustainable Practices`,
      `${city} Named Top City for Entrepreneurs in 2025`,
      `Financial Sector in ${city} Shows Strong Q2 Growth`
    ];
    
    const cityHash = [...city.toLowerCase()].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const headline = headlines[cityHash % headlines.length];
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return headline;
  } catch (error) {
    console.error('Error fetching business news:', error);
    return null;
  }
};
