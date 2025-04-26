
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { getTimeZoneAcronym, formatTimeZone } from '@/utils/timeZoneUtils';

interface TimeConversionCardProps {
  city: string;
  time: Date;
  offset: number;
  isSource?: boolean;
}

export const TimeConversionCard = ({ city, time, offset, isSource }: TimeConversionCardProps) => {
  return (
    <Card className={`border-white/10 ${isSource ? 'bg-black/60' : 'bg-black/40'}`}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Clock className={`h-5 w-5 ${isSource ? 'text-[#3dd68c]' : 'text-white/60'}`} />
        <CardTitle className="text-lg font-medium text-white">
          {city}
          {isSource && <span className="ml-2 text-xs text-[#3dd68c]">(Source Time)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-medium ${isSource ? 'text-[#3dd68c]' : 'text-white'}`}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <span className="text-xs text-white/60">
            {getTimeZoneAcronym(offset)} ({formatTimeZone(offset)})
          </span>
        </div>
        <p className="text-sm text-white/60">
          {time.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </CardContent>
    </Card>
  );
};
