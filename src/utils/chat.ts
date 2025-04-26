
import { toast } from "sonner";

export async function processMessage(message: string, apiKey: string): Promise<{ content: string; cities: string[]; suggestedTime?: string }> {
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
                   1. List each city mentioned and its current time
                   2. Suggest 2-3 optimal meeting times that work well for all participants
                   3. Keep responses concise and focused on time zone information
                   4. Always return the best meeting time in the format "X:XX AM/PM" (e.g., "2:00 PM")`
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
    
    // Better city extraction regex
    const cityRegex = /\b(?:(?!am|pm|time|about)[A-Z][a-zA-Z\s]{2,})\b/g;
    const cities = content.match(cityRegex) || [];
    
    // Improved time extraction
    const suggestedTimeMatch = content.match(/(?:suggested|optimal|best|recommended)(?:\s+meeting)?\s+times?:?\s*([0-9]{1,2}:[0-9]{2}\s*[AP]M)/i);
    const suggestedTime = suggestedTimeMatch ? suggestedTimeMatch[1].trim() : undefined;

    console.log("Extracted cities:", cities);
    console.log("Suggested time:", suggestedTime);

    return { content, cities, suggestedTime };
  } catch (error) {
    console.error('Error processing message:', error);
    toast.error('Failed to process message. Please check your API key and try again.');
    throw error;
  }
}
