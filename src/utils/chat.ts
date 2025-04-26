
import { toast } from "sonner";

export async function processMessage(message: string, apiKey: string): Promise<string> {
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
                   3. Keep responses concise and focused on time zone information`
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

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error processing message:', error);
    toast.error('Failed to process message. Please check your API key and try again.');
    throw error;
  }
}
