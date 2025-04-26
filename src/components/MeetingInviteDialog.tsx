import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Copy, Send } from 'lucide-react';
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
  const {
    toast
  } = useToast();
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
  return <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-4 mx-[8px]">
          <Mail className="mr-2 h-4 w-4" />
          Send Meeting Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black/90 text-white border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Send Meeting Invite</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="sender-name">Your Name</Label>
            <Input id="sender-name" value={senderName} onChange={e => setSenderName(e.target.value)} className="bg-black/50 border-white/20 text-white" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sender-email">Your Email</Label>
            <Input id="sender-email" type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} className="bg-black/50 border-white/20 text-white" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recipient-emails">Recipient Emails (comma separated)</Label>
            <Input id="recipient-emails" value={recipientEmails} onChange={e => setRecipientEmails(e.target.value)} placeholder="email1@example.com, email2@example.com" className="bg-black/50 border-white/20 text-white" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meeting-link">Meeting Link</Label>
            <div className="flex gap-2">
              <Input id="meeting-link" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="Paste your meeting link here" className="bg-black/50 border-white/20 text-white" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-white/60 mt-2">
            <p>Meeting Time: {meetingTime}</p>
            <p>Date: {date}</p>
          </div>
          <Button className="mt-4 bg-[#3dd68c] hover:bg-[#34bb7a] text-black" onClick={handleSendInvite}>
            <Send className="mr-2 h-4 w-4" />
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};