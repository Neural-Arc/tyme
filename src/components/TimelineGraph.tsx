
import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { formatTime, getTimeZoneAcronym, formatTimeZone } from '@/utils/timeZoneUtils';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface TimelineGraphProps {
  timeZoneData: {
    city: string;
    localTime: string;
    offset: number;
    workingHours: number[];
  }[];
  bestTimeRange: {
    utcHour: number;
    localHour: number;
    formattedLocal: string;
    cityTimes: Record<string, string>;
  } | null;
  defaultLocation?: string;
  timeZoneName: string;
  currentDate: Date;
}

export const TimelineGraph = ({
  timeZoneData,
  bestTimeRange,
  defaultLocation,
  timeZoneName,
  currentDate
}: TimelineGraphProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Sort cities to put default location first
  const sortedCities = [...timeZoneData].sort((a, b) => {
    if (a.city === defaultLocation) return -1;
    if (b.city === defaultLocation) return 1;
    return a.city.localeCompare(b.city);
  });

  // Calculate current hour in each timezone
  const currentHour = new Date().getHours();
  const getCurrentHourForCity = (offset: number) => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    return ((utcHour + offset + 24) % 24);
  };

  // Handle horizontal scrolling with mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scrollRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (scrollRef.current) {
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (timeZoneData.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-up">
        <p className="text-white text-center">Please select cities to display time zones.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 md:p-6 animate-fade-up backdrop-blur-md">
      {bestTimeRange && defaultLocation && (
        <div className="mb-4 p-3 md:p-5 glass-card relative overflow-hidden border-gradient">
          <div className="absolute inset-0 opacity-20 bg-gradient"></div>
          <div className="relative z-10">
            <h3 className="text-sm md:text-base font-medium gradient-text flex items-center gap-2">
              <Clock className="h-4 w-4" /> Best Meeting Time
            </h3>
            <p className="text-white/70 text-xs md:text-sm mt-1">
              {bestTimeRange.formattedLocal} ({timeZoneName}) on {currentDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        {/* Hour markers */}
        <div className="flex border-b border-white/10 pl-[160px] mb-2">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div 
              key={`hour-${hour}`} 
              className="flex-shrink-0 w-12 text-center text-xs text-white/60"
            >
              {hour === 0 || hour === 12 ? (
                <span className="gradient-text font-medium">
                  {hour === 0 ? '12 AM' : '12 PM'}
                </span>
              ) : (
                `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`
              )}
            </div>
          ))}
        </div>

        {/* City timelines */}
        <div 
          ref={scrollRef}
          className="max-w-full overflow-x-auto timeline-scroll"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="min-w-[calc(24*3rem+160px)]">
            {sortedCities.map((city, cityIndex) => {
              const cityCurrentHour = getCurrentHourForCity(city.offset);
              
              return (
                <div 
                  key={`${city.city}-${cityIndex}`} 
                  className="flex items-center mb-4 last:mb-0"
                >
                  <div className="w-[160px] pr-4 flex-shrink-0">
                    <div className="text-sm font-medium truncate">
                      <span className={city.city === defaultLocation ? "gradient-text" : "text-white"}>
                        {city.city}
                        {city.city === defaultLocation && (
                          <span className="ml-1 text-xs">(Current)</span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">
                      {getTimeZoneAcronym(city.offset)} ({formatTimeZone(city.offset)})
                    </div>
                  </div>

                  {/* 24-hour timeline */}
                  <div className="flex flex-grow">
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const localHour = (hour + city.offset + 24) % 24;
                      const isWorkingHour = localHour >= 8 && localHour <= 20;
                      const isBestTimeHour = bestTimeRange && hour === bestTimeRange.utcHour;
                      const isCurrentHour = Math.floor(localHour) === Math.floor(cityCurrentHour);

                      return (
                        <TooltipProvider key={`${city.city}-hour-${hour}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className={`
                                  w-12 h-10 flex items-center justify-center m-px relative
                                  ${isWorkingHour ? 'bg-white/10' : 'bg-black/40'} 
                                  ${isBestTimeHour ? 'best-time-cell' : ''}
                                  ${isCurrentHour ? 'border-l-2 border-r-2 border-yellow-400/50' : ''}
                                  hover:bg-white/20 transition-all duration-200
                                  rounded-md
                                `}
                              >
                                {isCurrentHour && (
                                  <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                                )}
                                {isBestTimeHour && (
                                  <div className="absolute inset-0 animate-pulse-subtle rounded-md bg-gradient"></div>
                                )}
                                <span className="text-xs text-white/80 relative z-10">
                                  {isWorkingHour && formatTime(localHour).split(' ')[0]}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="text-xs">
                                <div className="font-medium">{city.city}</div>
                                <div>{formatTime(localHour)}</div>
                                {isWorkingHour ? (
                                  <div className="text-green-400">Working Hours</div>
                                ) : (
                                  <div className="text-gray-400">Non-Working Hours</div>
                                )}
                                {isBestTimeHour && (
                                  <div className="text-yellow-400 mt-1 font-medium">Best Meeting Time</div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6 justify-center text-xs text-white/60">
        <span>Drag to scroll horizontally</span>
        <span>•</span>
        <span>All times shown in your local time zone ({timeZoneName})</span>
        <span>•</span>
        <span>Working hours: 8 AM - 8 PM</span>
      </div>
    </div>
  );
};
