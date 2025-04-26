
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader } from 'lucide-react';
import { processMessage } from '@/utils/chat';
import { toast } from 'sonner';
import { useLocation } from '@/hooks/useLocation';

export const Chat = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { defaultLocation } = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      toast.error('Please add your OpenAI API key in settings first');
      return;
    }

    if (!defaultLocation) {
      toast.error('Please set your location in settings first');
      return;
    }

    setIsLoading(true);

    try {
      // Add user's location to the input if not already mentioned
      const processInput = input.toLowerCase().includes(defaultLocation.toLowerCase())
        ? input
        : `${input}, ${defaultLocation}`;

      const { cities, suggestedTime, specifiedDate } = await processMessage(processInput, apiKey);
      
      if (cities.length > 0 && suggestedTime) {
        const event = new CustomEvent('updateTimeZones', { 
          detail: { cities, suggestedTime, specifiedDate } 
        });
        window.dispatchEvent(event);
        toast.success(`Found ${cities.length} cities and suggested meeting time ${suggestedTime}`);
      } else {
        toast.error('Could not identify cities or meeting time from your message. Please be more specific.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while processing your request');
    } finally {
      setInput('');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <p className="text-center text-xl mb-8 text-white/80">
        Type cities or countries and we'll find your best call time...
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`e.g. New York, Tokyo for next Monday... (Your location: ${defaultLocation || 'Not set'})`}
          className="bg-black/30 text-white border-white/10 text-2xl h-24 px-6"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          variant="outline" 
          className="bg-black/30 border-white/10 hover:bg-white/10 h-24 w-16"
          disabled={isLoading || !defaultLocation}
        >
          {isLoading ? (
            <Loader className="h-8 w-8 animate-spin" />
          ) : (
            <MessageSquare className="h-8 w-8" />
          )}
        </Button>
      </form>
    </div>
  );
};
