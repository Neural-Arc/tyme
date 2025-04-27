import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Copy, Send, Calendar } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

interface MeetingInviteDialogProps {
  meetingTime: string;
  date: string;
}

export const MeetingInviteDialog = ({
  meetingTime,
  date
}: MeetingInviteDialogProps) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const generateGoogleMeetLink = () => {
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;
    setMeetingLink(meetLink);
    toast({
      description: "Google Meet link generated successfully!",
      duration: 2000
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink).then(() => {
      toast({
        description: "Meeting link copied to clipboard!",
        duration: 2000
      });
    });
  };
  const handleSendInvite = () => {
    // Form validation
    if (!senderName || !senderEmail || !recipientEmails) {
      toast({
        variant: "destructive",
        description: "Please fill in all required fields",
        duration: 3000
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      toast({
        variant: "destructive",
        description: "Please enter a valid email address",
        duration: 3000
      });
      return;
    }

    // In a real app, you would send the invite here
    // For now, we'll just show a success toast
    toast({
      description: "Meeting invite sent successfully!",
      duration: 3000
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-4 mx-[8px]">
          <Mail className="mr-2 h-4 w-4" />
          Send Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] bg-black/90 text-white border border-white/10 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Send Meeting Invite</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sender-name">Your Name</Label>
              <Input 
                id="sender-name" 
                value={senderName} 
                onChange={e => setSenderName(e.target.value)} 
                className="bg-black/50 border-white/20 text-white" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sender-email">Your Email</Label>
              <Input 
                id="sender-email" 
                type="email" 
                value={senderEmail} 
                onChange={e => setSenderEmail(e.target.value)} 
                className="bg-black/50 border-white/20 text-white" 
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="recipient-emails">Recipient Emails (comma separated)</Label>
            <Input 
              id="recipient-emails" 
              value={recipientEmails} 
              onChange={e => setRecipientEmails(e.target.value)} 
              placeholder="email1@example.com, email2@example.com" 
              className="bg-black/50 border-white/20 text-white" 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meeting-link">Meeting Link</Label>
            <div className="flex gap-2">
              <Input 
                id="meeting-link" 
                value={meetingLink} 
                onChange={e => setMeetingLink(e.target.value)} 
                placeholder="Your meeting link will appear here" 
                className="bg-black/50 border-white/20 text-white flex-1" 
                readOnly 
              />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={generateGoogleMeetLink}>
                Generate Meet Link
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Meeting Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-black/50 border-white/20 text-white min-h-[200px]"
              placeholder="Enter meeting agenda and details..."
            />
          </div>

          <div className="text-sm text-white/60 mt-2">
            <p>Meeting Time: {meetingTime}</p>
            <p>Date: {date}</p>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-[#3dd68c] hover:bg-[#34bb7a] text-black" 
              onClick={handleSendInvite}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                // Add Google Calendar integration here
                toast({
                  description: "Google Calendar integration coming soon!",
                  duration: 2000
                });
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
