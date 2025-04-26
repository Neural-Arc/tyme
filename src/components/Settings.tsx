
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings = () => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    // TODO: Implement API key saving
    localStorage.setItem('openai_api_key', apiKey);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="absolute top-4 right-4 text-white/60 hover:text-white">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-muted border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Settings</DialogTitle>
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
          <Button onClick={handleSave} className="w-full bg-white/5 border-white/10 hover:bg-white/10">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
