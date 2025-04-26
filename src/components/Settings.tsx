
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.startsWith('sk-')) {
      toast.error('Please enter a valid OpenAI API key');
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    toast.success('Settings saved successfully');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="absolute top-4 right-4 text-white/60 hover:text-white">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-muted border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Settings</DialogTitle>
          <DialogDescription className="text-white/60">
            Configure your API key
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60">OpenAI API Key</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-background border-white/10 text-white mt-2"
              placeholder="sk-..."
            />
          </div>
          <Button 
            onClick={handleSave} 
            className="w-full bg-white/5 border-white/10 hover:bg-white/10"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
