import React, { useState, useRef } from 'react';
import { Clock, X } from 'lucide-react';
import { formatTime, getTimeZoneAcronym, formatTimeZone } from '@/utils/timeZoneUtils';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { BestTimeHeader } from './time-scale/BestTimeHeader';
import { Button } from './ui/button';

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
  onRemoveTimezone?: (city: string) => void;
}

export const TimelineGraph = ({
  timeZoneData,
  bestTimeRange,
  defaultLocation,
  timeZoneName,
  currentDate,
  onRemoveTimezone
}: TimelineGraphProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

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

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour === selectedHour ? null : hour);
  };

  const handleHourHover = (hour: number) => {
    setHoveredHour(hour);
  };

  const handleHourLeave = () => {
    setHoveredHour(null);
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
        <BestTimeHeader 
          bestTimeRange={bestTimeRange}
          currentDate={currentDate}
          timeZoneName={timeZoneName}
        />
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
                  className="flex items-center mb-4 last:mb-0 group"
                >
                  <div className="w-[160px] pr-4 flex-shrink-0 flex items-center justify-between">
                    <div>
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
                    {onRemoveTimezone && city.city !== defaultLocation && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        onClick={() => onRemoveTimezone(city.city)}
                      >
                        <X className="h-4 w-4 text-white/60 hover:text-white" />
                      </Button>
                    )}
                  </div>

                  {/* 24-hour timeline */}
                  <div className="flex flex-grow">
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const localHour = (hour + city.offset + 24) % 24;
                      const isWorkingHour = localHour >= 8 && localHour <= 20;
                      const isBestTimeHour = bestTimeRange && hour === bestTimeRange.utcHour;
                      const isCurrentHour = Math.floor(localHour) === Math.floor(cityCurrentHour);
                      const isSelected = hour === selectedHour;
                      const isHovered = hour === hoveredHour;

                      return (
                        <TooltipProvider key={`${city.city}-hour-${hour}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className={`
                                  w-12 h-10 flex items-center justify-center m-px relative
                                  ${isWorkingHour ? 'bg-white/10 hover:bg-white/20' : 'bg-black/40 hover:bg-black/60'} 
                                  ${isBestTimeHour ? 'best-time-cell' : ''}
                                  ${isCurrentHour ? 'border-l-2 border-r-2 border-yellow-400/50 bg-yellow-400/10' : ''}
                                  ${isSelected ? 'bg-blue-500/20 border-2 border-blue-400' : ''}
                                  ${isHovered ? 'bg-blue-400/10 border border-blue-400/50' : ''}
                                  transition-all duration-200
                                  rounded-md
                                  cursor-pointer
                                `}
                                onClick={() => handleHourClick(hour)}
                                onMouseEnter={() => handleHourHover(hour)}
                                onMouseLeave={handleHourLeave}
                              >
                                {isCurrentHour && (
                                  <>
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    <div className="absolute inset-0 border-2 border-yellow-400/30 rounded-md"></div>
                                  </>
                                )}
                                {isBestTimeHour && (
                                  <div className="absolute inset-0 animate-pulse-subtle rounded-md bg-gradient"></div>
                                )}
                                <span className={`
                                  text-xs relative z-10
                                  ${isWorkingHour ? 'text-white/80' : 'text-white/40'}
                                  ${isCurrentHour ? 'text-yellow-400 font-medium' : ''}
                                  ${isBestTimeHour ? 'text-white font-medium' : ''}
                                  ${isSelected ? 'text-blue-400 font-medium' : ''}
                                  ${isHovered ? 'text-blue-400' : ''}
                                `}>
                                  {formatTime(localHour).split(' ')[0]}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-black/90 backdrop-blur-md border-white/10">
                              <div className="text-xs space-y-1">
                                <div className="font-medium text-white">{city.city}</div>
                                <div className="text-white/80">{formatTime(localHour)}</div>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${isWorkingHour ? 'bg-green-400' : 'bg-gray-400'}`} />
                                  <span className={isWorkingHour ? 'text-green-400' : 'text-gray-400'}>
                                    {isWorkingHour ? 'Working Hours' : 'Non-Working Hours'}
                                  </span>
                                </div>
                                {isBestTimeHour && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <span className="text-yellow-400 font-medium">Best Meeting Time</span>
                                  </div>
                                )}
                                {isCurrentHour && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <span className="text-yellow-400 font-medium">Current Time</span>
                                  </div>
                                )}
                                {isSelected && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    <span className="text-blue-400 font-medium">Selected Time</span>
                                  </div>
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
        <span>Click to select a time • Hover to highlight across timezones</span>
        <span>•</span>
        <span>Drag to scroll horizontally</span>
        <span>•</span>
        <span>All times shown in your local time zone ({timeZoneName})</span>
        <span>•</span>
        <span>Working hours: 8 AM - 8 PM</span>
      </div>
    </div>
  );
};
