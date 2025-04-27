
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
    <div className="mb-6 p-4 bg-black/50 border border-white/10 rounded-lg">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium">
            <span className="font-bold bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent">
              Best meeting time:
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent">
              {bestTimeRange.formattedLocal}
            </span>
            <br />
            <span className="text-white/60">
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
