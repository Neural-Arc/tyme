
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Copy, Send, Loader2 } from 'lucide-react';
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
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);
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

  const handleSendInvite = async () => {
    // Form validation
    if (!senderName || !senderEmail || !recipientEmails || !description || !meetingLink) {
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
        description: "Please enter a valid sender email address",
        duration: 3000
      });
      return;
    }

    // Validate recipient emails (comma separated)
    const recipients = recipientEmails.split(',').map(email => email.trim());
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      toast({
        variant: "destructive",
        description: `Invalid recipient email(s): ${invalidEmails.join(', ')}`,
        duration: 3000
      });
      return;
    }

    setIsSending(true);

    try {
      // Send email to each recipient
      for (const recipientEmail of recipients) {
        const emailContent = `
          <div style="font-family: sans-serif;">
            <p>Hello,</p>
            <p>You have been invited to a meeting by ${senderName} (${senderEmail}).</p>
            <p><strong>Meeting Details:</strong></p>
            <p>Date: ${date}</p>
            <p>Time: ${meetingTime}</p>
            <p>Meeting Link: <a href="${meetingLink}">${meetingLink}</a></p>
            <p><strong>Message:</strong></p>
            <p>${description.replace(/\n/g, '<br/>')}</p>
            <hr/>
            <p style="color: #666; font-size: 12px;">Sent via Tyme!</p>
          </div>
        `;

        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer re_VTZG7Eaa_JBrKDGivXkodXJ83UoSt5p3X',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'noreply@tymeai.com',
              to: recipientEmail,
              subject: 'Meeting Invite',
              html: emailContent
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to send email to ${recipientEmail}`);
          }
        } catch (error) {
          console.error('Email sending error:', error);
          throw error; // Re-throw to be caught by outer catch block
        }
      }

      // Success handling
      toast({
        description: "✅ Invitation sent successfully!",
        duration: 3000
      });
      
      // Reset form and close dialog
      setSenderName('');
      setSenderEmail('');
      setRecipientEmails('');
      setDescription('');
      setMeetingLink('');
      setOpen(false);
      
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        variant: "destructive",
        description: "Failed to send invitation. Please try again.",
        duration: 3000
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2 md:ml-4 mx-[4px] md:mx-[8px] hover:bg-gradient-to-r hover:from-[#FFD93B] hover:via-[#FF4E9B] hover:to-[#2AC4F2]">
          <Mail className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Send Invite</span>
          <span className="sm:hidden">Invite</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[600px] h-[90vh] bg-black/90 text-white border border-white/10 overflow-y-auto mx-2">
        <DialogHeader>
          <DialogTitle>Send Meeting Invitation</DialogTitle>
          <DialogDescription className="text-white/70">
            Fill out the form to send meeting invitations via email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative -mt-2 -mx-6 mb-0 py-0">
          <img alt="Meeting Banner" className="w-full h-[120px] md:h-[200px] object-cover" src="/lovable-uploads/018f957d-6791-4e60-8334-7c2b7ca353d4.png" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sender-name">Your Name *</Label>
            <Input 
              id="sender-name" 
              value={senderName} 
              onChange={e => setSenderName(e.target.value)} 
              className="bg-black/50 border-white/20 text-white" 
              disabled={isSending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sender-email">Your Email *</Label>
            <Input 
              id="sender-email" 
              type="email" 
              value={senderEmail} 
              onChange={e => setSenderEmail(e.target.value)} 
              className="bg-black/50 border-white/20 text-white"
              disabled={isSending}
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="recipient-emails">Recipient Emails * (comma separated)</Label>
          <Input 
            id="recipient-emails" 
            value={recipientEmails} 
            onChange={e => setRecipientEmails(e.target.value)} 
            placeholder="email1@example.com, email2@example.com" 
            className="bg-black/50 border-white/20 text-white"
            disabled={isSending}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="meeting-link">Meeting Link *</Label>
          <div className="flex gap-2">
            <Input 
              id="meeting-link" 
              value={meetingLink} 
              onChange={e => setMeetingLink(e.target.value)} 
              placeholder="Your meeting link will appear here" 
              className="bg-black/50 border-white/20 flex-1 bg-gradient-to-r from-[#FFD93B] via-[#FF4E9B] to-[#2AC4F2] bg-clip-text text-transparent" 
              readOnly
              disabled={isSending}
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopyLink}
              disabled={isSending}
              className="hover:bg-gradient-to-r hover:from-[#FFD93B] hover:via-[#FF4E9B] hover:to-[#2AC4F2]"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={generateGoogleMeetLink}
              disabled={isSending}
              className="hover:bg-gradient-to-r hover:from-[#FFD93B] hover:via-[#FF4E9B] hover:to-[#2AC4F2]"
            >
              Generate Meet Link
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Meeting Description *</Label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="bg-black/50 border-white/20 text-white min-h-[150px]" 
            placeholder="Enter meeting agenda and details..."
            disabled={isSending}
          />
        </div>

        <div className="text-sm text-white mt-2">
          <p className="flex flex-wrap gap-2">
            <span>Meeting Time:</span>
            <span className="text-white/90">{meetingTime}</span>
          </p>
          <p className="flex flex-wrap gap-2">
            <span>Date:</span>
            <span className="text-white/90">{date}</span>
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={handleSendInvite} 
            disabled={isSending}
            className="flex-1 text-white bg-gradient-to-r from-[#FFD93B] via-[#FF4E9B] to-[#2AC4F2] hover:opacity-90 transition-all duration-300"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Send Invitation</span>
                <span className="sm:hidden">Send</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
