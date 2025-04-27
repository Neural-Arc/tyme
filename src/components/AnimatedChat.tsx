import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Loader } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { validateInput, suggestCompletion } from '@/utils/inputValidation';
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  // Define SpeechRecognition type for TypeScript
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    transcript: string;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
  const startListening = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition() as SpeechRecognition;
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          toast({
            description: "Speech recognized successfully!",
            duration: 2000
          });
        };
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            variant: "destructive",
            description: "Error recognizing speech. Please try again.",
            duration: 3000
          });
        };
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        setRecognition(recognitionInstance);
        recognitionInstance.start();
        setIsListening(true);
      } else {
        toast({
          variant: "destructive",
          description: "Speech recognition is not supported in your browser.",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        variant: "destructive",
        description: "Failed to initialize speech recognition.",
        duration: 3000
      });
    }
  };
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('resetTimeZones'));
    setInput('');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    window.location.reload();
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    const newSuggestions = suggestCompletion(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const words = input.split(' ');
    words[words.length - 1] = suggestion;
    setInput(words.join(' '));
    setShowSuggestions(false);
  };

  return (
    <div className={cn("center-content relative", !showResults && "flex flex-col items-center justify-center")}>
      <div className="flex justify-center mb-8">
        <a href="/" onClick={handleLogoClick} className="hover:scale-105 transition-transform">
          <img alt="App Logo" width={120} height={120} className="mx-auto object-contain w-[120px] h-[120px]" src="/lovable-uploads/7ea42db7-8f3b-44cd-8337-e589c12f74fd.png" />
        </a>
      </div>

      <p className="text-center mb-8 text-3xl font-medium text-zinc-50">Find Your Perfect Tyme</p>

      <div className="relative w-full">
        <div 
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'radial-gradient(circle, rgba(255,87,34,0.2) 0%, rgba(76,175,80,0.2) 33%, rgba(33,150,243,0.2) 66%, rgba(156,39,176,0.2) 100%)',
            filter: 'blur(20px)',
            opacity: 0.8
          }}
        />
        
        <form onSubmit={handleSubmit} className="relative flex gap-2 w-full">
          <div className="flex-1 relative">
            <Input 
              value={input} 
              onChange={(e) => handleInputChange(e.target.value)} 
              placeholder={`e.g. New York, Tokyo for next Monday... ${defaultLocation ? `(Your location: ${defaultLocation})` : ''}`} 
              className={cn(
                "bg-black/50 backdrop-blur-md text-2xl h-16 px-6 border-white/10 focus:ring-0 focus:ring-offset-0 focus:outline-none", 
                input && "gradient-text"
              )} 
              disabled={isLoading || !defaultLocation || !localStorage.getItem('openai_api_key')} 
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full z-50 mt-1">
                <Command className="rounded-lg border shadow-md">
                  <CommandList>
                    {suggestions.map((suggestion, index) => (
                      <CommandItem 
                        key={index}
                        onSelect={() => handleSuggestionClick(suggestion)}
                        className="cursor-pointer"
                      >
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="iconGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{
                    stopColor: '#FFD93B'
                  }} />
                    <stop offset="25%" style={{
                    stopColor: '#FF8A00'
                  }} />
                    <stop offset="50%" style={{
                    stopColor: '#FF4E9B'
                  }} />
                    <stop offset="75%" style={{
                    stopColor: '#A050F8'
                  }} />
                    <stop offset="100%" style={{
                    stopColor: '#2AC4F2'
                  }} />
                  </linearGradient>
                </defs>
              </svg>
              <Button type="button" variant="outline" className="bg-black border-white/10 hover:bg-white/10 h-16 w-16" onClick={isListening ? stopListening : startListening} disabled={isLoading || !defaultLocation || !localStorage.getItem('openai_api_key')}>
                {isListening ? <MicOff className="h-6 w-6 stroke-red-500" /> : <Mic className="h-6 w-6" style={{
                stroke: 'url(#iconGradient)',
                fill: 'none',
                strokeWidth: 2
              }} />}
              </Button>
            </div>
            <Button type="submit" variant="outline" className="bg-black border-white/10 hover:bg-white/10 h-16 w-16" disabled={isLoading || !defaultLocation || !localStorage.getItem('openai_api_key')}>
              {isLoading ? <Loader className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" style={{
              stroke: 'url(#iconGradient)',
              fill: 'none',
              strokeWidth: 2
            }} />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
