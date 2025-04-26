
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader } from 'lucide-react';
import { processMessage } from '@/utils/chat';
import { toast } from 'sonner';

export const Chat = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      toast.error('Please add your OpenAI API key in settings first');
      return;
    }

    setIsLoading(true);

    try {
      const { content, cities, suggestedTime } = await processMessage(input, apiKey);
      
      // Update time zones with the extracted cities and suggested time
      if (cities.length > 0) {
        const event = new CustomEvent('updateTimeZones', { 
          detail: { cities, suggestedTime } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setInput('');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <p className="text-center text-xl mb-8 text-white/80">
        Type the cities and we'll find the best time for your global call.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Find a good time for San Francisco, London, and Tokyo..."
          className="bg-muted text-white border-white/10 text-2xl h-24 px-6"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          variant="outline" 
          className="bg-white/5 border-white/10 hover:bg-white/10 h-24 w-16"
          disabled={isLoading}
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
