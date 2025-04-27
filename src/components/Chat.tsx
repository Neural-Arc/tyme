import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { processMessage } from '@/utils/chat';
import { useLocation } from '@/hooks/useLocation';
import { AnimatedChat } from './AnimatedChat';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogTrigger } from './ui/dialog';
import { Settings as SettingsComponent } from './Settings';

export const Chat = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { defaultLocation, isLoading: locationLoading } = useLocation();

  useEffect(() => {
    const handleReset = () => {
      setShowResults(false);
      setInput('');
    };

    window.addEventListener('resetTimeZones', handleReset);
    return () => {
      window.removeEventListener('resetTimeZones', handleReset);
    };
  }, []);

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

      const response = await processMessage(processInput, apiKey);
      
      if (response.timeConversionRequest) {
        const event = new CustomEvent('updateTimeZones', { 
          detail: { 
            timeConversionRequest: response.timeConversionRequest,
            specifiedDate: response.specifiedDate 
          } 
        });
        window.dispatchEvent(event);
        setShowResults(true);
        toast.success('Time conversion completed successfully');
      } else if (response.cities.length > 0 && response.suggestedTime) {
        const event = new CustomEvent('updateTimeZones', { 
          detail: { 
            cities: response.cities, 
            suggestedTime: response.suggestedTime, 
            specifiedDate: response.specifiedDate 
          } 
        });
        window.dispatchEvent(event);
        setShowResults(true);
        toast.success(`Found ${response.cities.length} cities and suggested meeting time ${response.suggestedTime}`);
      } else {
        toast.error('Could not process your request. Try being more specific with the city and time format (e.g., "10 AM Sydney time tomorrow" or "Schedule a meeting with London at 2 PM")');
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
        <Alert className="mb-4 bg-black border-orange-400/20 text-white">
          <Info className="h-5 w-5 text-orange-400" />
          <AlertTitle>Location Access Required</AlertTitle>
          <AlertDescription>
            Please allow location access to use the app. This helps us calculate accurate meeting times.
          </AlertDescription>
        </Alert>
      )}
      
      {!localStorage.getItem('openai_api_key') && (
        <Alert className="mb-4 bg-black border-orange-400/20 text-white flex items-center justify-between">
          <div className="flex-1">
            <Info className="h-5 w-5 text-orange-400" />
            <AlertTitle>API Key Required</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              Please add your OpenAI API key to use the chat.
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="ml-2 bg-orange-400/10 border-orange-400/20 text-orange-400 hover:bg-orange-400/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Open Settings
                  </Button>
                </DialogTrigger>
                <SettingsComponent />
              </Dialog>
            </AlertDescription>
          </div>
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
