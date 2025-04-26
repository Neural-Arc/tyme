
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

export const Chat = () => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement chat submission
    setInput('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-center text-lg mb-8 text-white/80">
        Type the cities and we'll find the best time for your global call.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Find a good time for San Francisco, London, and Tokyo..."
          className="bg-muted text-white border-white/10"
        />
        <Button type="submit" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};
