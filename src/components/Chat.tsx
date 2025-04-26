
import { useState } from 'react';
import { toast } from 'sonner';
import { processMessage } from '@/utils/chat';
import { useLocation } from '@/hooks/useLocation';
import { AnimatedChat } from './AnimatedChat';

export const Chat = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
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
      const processInput = input.toLowerCase().includes(defaultLocation.toLowerCase())
        ? input
        : `${input}, ${defaultLocation}`;

      const { cities, suggestedTime, specifiedDate } = await processMessage(processInput, apiKey);
      
      if (cities.length > 0 && suggestedTime) {
        const event = new CustomEvent('updateTimeZones', { 
          detail: { cities, suggestedTime, specifiedDate } 
        });
        window.dispatchEvent(event);
        setShowResults(true);
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
    <AnimatedChat
      input={input}
      setInput={setInput}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      defaultLocation={defaultLocation}
      showResults={showResults}
    />
  );
};
