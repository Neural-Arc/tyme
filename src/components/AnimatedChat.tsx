
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Loader } from 'lucide-react';
import { cn } from "@/lib/utils";

// Explicitly import the global type for TypeScript clarity
type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

interface AnimatedChatProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  defaultLocation?: string;
  showResults: boolean;
}

export const AnimatedChat = ({ 
  input, 
  setInput, 
  handleSubmit, 
  isLoading, 
  defaultLocation,
  showResults 
}: AnimatedChatProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const startListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
      recognitionInstance.start();
      setIsListening(true);
    } else {
      console.error("Speech recognition not supported in this browser");
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className={cn(
      "w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out",
      showResults ? "mt-8" : "mt-[20vh]"
    )}>
      <div className="flex justify-center mb-8">
        <img 
          src="/logo.png" 
          alt="App Logo" 
          width="90" 
          height="90" 
          className="object-contain" 
        />
      </div>
      
      <p className="text-center text-xl mb-8 text-white/80">
        Type cities or countries and we'll find your best call time...
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`e.g. New York, Tokyo for next Monday... (Your location: ${defaultLocation || 'Not set'})`}
          className="bg-black/30 text-white border-white/10 text-2xl h-16 px-6"
          disabled={isLoading || isListening}
        />
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="bg-black/30 border-white/10 hover:bg-white/10 h-16 w-16"
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
          >
            {isListening ? (
              <MicOff className="h-6 w-6 text-red-500" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          <Button 
            type="submit" 
            variant="outline" 
            className="bg-black/30 border-white/10 hover:bg-white/10 h-16 w-16"
            disabled={isLoading || !defaultLocation}
          >
            {isLoading ? (
              <Loader className="h-6 w-6 animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
