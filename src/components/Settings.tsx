
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Settings = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedOpenaiKey = localStorage.getItem('openai_api_key');
    const savedResendKey = localStorage.getItem('resend_api_key');
    
    if (savedOpenaiKey) {
      setOpenaiApiKey(savedOpenaiKey);
    }
    
    if (savedResendKey) {
      setResendApiKey(savedResendKey);
    }
  }, []);

  const handleSave = () => {
    // Validate OpenAI API key
    if (openaiApiKey && !openaiApiKey.startsWith('sk-')) {
      toast.error('Please enter a valid OpenAI API key');
      return;
    }

    // Validate Resend API key
    if (resendApiKey && !resendApiKey.startsWith('re_')) {
      toast.error('Please enter a valid Resend API key');
      return;
    }

    // Save both keys
    if (openaiApiKey) {
      localStorage.setItem('openai_api_key', openaiApiKey);
    }
    
    if (resendApiKey) {
      localStorage.setItem('resend_api_key', resendApiKey);
    }
    
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
            Configure your API keys
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background/50">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="resend">Resend Email</TabsTrigger>
          </TabsList>
          <TabsContent value="openai" className="mt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">OpenAI API Key</label>
                <Input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  className="bg-background border-white/10 text-white mt-2"
                  placeholder="sk-..."
                />
                <p className="text-xs text-white/50 mt-1">For AI-powered features</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="resend" className="mt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">Resend API Key</label>
                <Input
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  className="bg-background border-white/10 text-white mt-2"
                  placeholder="re_..."
                />
                <p className="text-xs text-white/50 mt-1">For sending email invitations</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <Button 
          onClick={handleSave} 
          className="w-full bg-white/5 border-white/10 hover:bg-white/10 mt-4"
        >
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
};
