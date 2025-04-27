
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
  return (
    <div className="mb-6 glass-card p-5 border border-gradient rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-gradient"></div>
      <div className="flex justify-between items-start flex-wrap gap-2 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium space-y-1">
            <span className="font-bold text-white">
              Best meeting time:
            </span>
            <br />
            <span className="text-2xl text-white inline-block">
              {bestTimeRange.formattedLocal}
            </span>
            <br />
            <span className="text-white/60 text-sm">
              {currentDate.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MeetingInviteDialog 
            meetingTime={bestTimeRange.formattedLocal} 
            date={currentDate.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} 
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
