import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Loader } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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
  const {
    toast
  } = useToast();

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
  return <div className={cn("w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out", showResults ? "mt-8" : "mt-[20vh]")}>
      <div className="flex justify-center mb-8">
        <img alt="App Logo" width={120} height={120} className="mx-auto object-contain w-[120px] h-[120px]" onError={e => {
        console.error('Failed to load logo');
        const target = e.target as HTMLImageElement;
        target.src = '/logo.png';
      }} src="/lovable-uploads/97a170c6-860a-464b-a41f-38b2f2f7c5ca.png" />
      </div>
      
      <p className="text-center mb-8 text-white/80 text-lg">Our AI maps the perfect moment to meet.</p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder={`e.g. New York, Tokyo for next Monday... ${defaultLocation ? `(Your location: ${defaultLocation})` : ''}`} 
          className="bg-black text-white border-white/10 text-2xl h-16 px-6" 
          disabled={isLoading || !defaultLocation || !localStorage.getItem('openai_api_key')} 
        />
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="bg-black border-white/10 hover:bg-white/10 h-16 w-16" 
            onClick={isListening ? stopListening : startListening} 
            disabled={isLoading || !defaultLocation || !localStorage.getItem('openai_api_key')}
          >
            {isListening ? 
              <MicOff className="h-6 w-6 text-red-500" /> : 
              <Mic className="h-6 w-6 bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent" />}
          </Button>
          <Button 
            type="submit" 
            variant="outline" 
            className="bg-black border-white/10 hover:bg-white/10 h-16 w-16" 
            disabled={isLoading || !defaultLocation || !localStorage.getItem('openai_api_key')}
          >
            {isLoading ? 
              <Loader className="h-6 w-6 animate-spin" /> : 
              <Send className="h-6 w-6 bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent" />}
          </Button>
        </div>
      </form>
    </div>;
};
