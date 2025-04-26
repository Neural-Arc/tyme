
import { useState } from 'react';
import { toast } from 'sonner';
import { processMessage } from '@/utils/chat';
import { useLocation } from '@/hooks/useLocation';
import { AnimatedChat } from './AnimatedChat';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

export const Chat = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { defaultLocation, isLoading: locationLoading } = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      toast.error('Please add your OpenAI API key in settings first');
      return;
    }

    if (!defaultLocation || defaultLocation === 'Unknown Location') {
      toast.error('Please allow location access to use the app');
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
    <>
      {(!defaultLocation || defaultLocation === 'Unknown Location') && !locationLoading && (
        <Alert className="mb-4 bg-black border-yellow-600/50 text-white">
          <Info className="h-5 w-5 text-yellow-600" />
          <AlertTitle>Location Access Required</AlertTitle>
          <AlertDescription>
            Please allow location access to use the app. This helps us calculate accurate meeting times.
          </AlertDescription>
        </Alert>
      )}
      
      {!localStorage.getItem('openai_api_key') && (
        <Alert className="mb-4 bg-black border-blue-600/50 text-white">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            Please add your OpenAI API key in the settings (top-right gear icon) to use the chat.
          </AlertDescription>
        </Alert>
      )}
      
      <AnimatedChat
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        defaultLocation={defaultLocation}
        showResults={showResults}
      />
    </>
  );
};
