
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MeetingInviteDialog } from '../MeetingInviteDialog';

interface BestTimeHeaderProps {
  bestTimeRange: {
    formattedLocal: string;
    cityTimes: Record<string, string>;
  };
  currentDate: Date;
  timeZoneName: string;
}

export const BestTimeHeader = ({ bestTimeRange, currentDate, timeZoneName }: BestTimeHeaderProps) => {
  // Ensure the date is processed properly
  const meetingDate = new Date(currentDate);
  
  // Format the date using the browser's timezone
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }).format(meetingDate);

  return (
    <div className="mb-4 md:mb-6 glass-card p-3 md:p-5 border border-gradient rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-gradient"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-white whitespace-nowrap">Best meeting time:</span>
            <span className="text-2xl text-white">
              {bestTimeRange.formattedLocal},
            </span>
            <span className="text-white/60">
              {formattedDate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <MeetingInviteDialog 
            meetingTime={bestTimeRange.formattedLocal} 
            date={formattedDate}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Info className="h-4 w-4 text-white/60" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black/90 border border-white/10 text-white">
                <p>Times shown in your local time zone ({timeZoneName})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
