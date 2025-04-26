
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader } from 'lucide-react';
import { processMessage } from '@/utils/chat';
import { ChatMessage } from '@/types/chat';
import { toast } from 'sonner';

export const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      toast.error('Please add your OpenAI API key in settings first');
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { content, cities, suggestedTime } = await processMessage(input, apiKey);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

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
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-center text-lg mb-8 text-white/80">
        Type the cities and we'll find the best time for your global call.
      </p>
      
      <div className="space-y-4 mb-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`p-4 glass-card animate-fade-up ${
              message.role === 'assistant' ? 'bg-white/5' : 'bg-white/10'
            }`}
          >
            <p className="text-white/90">{message.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Find a good time for San Francisco, London, and Tokyo..."
          className="bg-muted text-white border-white/10"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          variant="outline" 
          className="bg-white/5 border-white/10 hover:bg-white/10"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <MessageSquare className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};
