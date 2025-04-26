
import { useState, useEffect } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface TimeScaleGraphProps {
  cities: string[];
  selectedDate: Date;
}

interface HourData {
  hour: number;
  displayHour: string;
  overlap: number;
  cities: string[];
}

export const TimeScaleGraph = ({ cities, selectedDate }: TimeScaleGraphProps) => {
  const [hourData, setHourData] = useState<HourData[]>([]);
  const [goldilockZone, setGoldilockZone] = useState<{start: number; end: number} | null>(null);

  useEffect(() => {
    if (!cities || cities.length === 0) return;
    
    const hours: HourData[] = Array.from({ length: 24 }, (_, i) => {
      const date = new Date(selectedDate);
      date.setHours(i, 0, 0, 0);
      return {
        hour: i,
        displayHour: format(date, 'h a'),
        overlap: 0,
        cities: []
      };
    });

    // Working hours (8 AM to 9 PM) for each city
    cities.forEach(city => {
      let offset = 0;
      
      // Simulate different time zones
      if (city.toLowerCase() === 'your location') offset = 0;
      else if (city.toLowerCase().includes('new york')) offset = 0;
      else if (city.toLowerCase().includes('london')) offset = 5;
      else if (city.toLowerCase().includes('tokyo')) offset = 13;
      else if (city.toLowerCase().includes('sydney')) offset = 15;
      else if (city.toLowerCase().includes('paris')) offset = 6;
      else if (city.toLowerCase().includes('dubai')) offset = 9;
      else if (city.toLowerCase().includes('singapore')) offset = 12;
      else if (city.toLowerCase().includes('los angeles')) offset = -3;
      else if (city.toLowerCase().includes('san francisco')) offset = -3;
      else if (city.toLowerCase().includes('beijing')) offset = 13;
      else if (city.toLowerCase().includes('mumbai')) offset = 10;
      else if (city.toLowerCase().includes('berlin')) offset = 6;
      else if (city.toLowerCase().includes('toronto')) offset = 0;
      else if (city.toLowerCase().includes('rio')) offset = 3;
      else if (city.toLowerCase().includes('cape town')) offset = 7;
      else if (city.toLowerCase().includes('mexico city')) offset = -1;
      else offset = Math.floor(Math.random() * 24);

      // Mark working hours (8 AM to 9 PM) for this city
      for (let h = 8; h <= 21; h++) {
        const adjustedHour = (h + offset) % 24;
        hours[adjustedHour].overlap += 1;
        hours[adjustedHour].cities.push(city);
      }
    });

    // Find the Goldilocks zone with maximum overlap
    let maxOverlap = Math.max(...hours.map(h => h.overlap));
    const bestHours = hours.filter(h => h.overlap === maxOverlap);
    
    if (bestHours.length > 0) {
      const sortedHours = bestHours.sort((a, b) => a.hour - b.hour);
      
      // Find consecutive hours to form a zone
      let startHour = sortedHours[0].hour;
      let endHour = startHour;
      let currentZoneLength = 1;
      let maxZoneLength = 1;
      let maxZoneStart = startHour;
      
      for (let i = 1; i < sortedHours.length; i++) {
        if (sortedHours[i].hour === endHour + 1) {
          // Part of the same zone
          endHour = sortedHours[i].hour;
          currentZoneLength++;
          
          if (currentZoneLength > maxZoneLength) {
            maxZoneLength = currentZoneLength;
            maxZoneStart = startHour;
          }
        } else {
          // Start of a new zone
          startHour = sortedHours[i].hour;
          endHour = startHour;
          currentZoneLength = 1;
        }
      }
      
      setGoldilockZone({
        start: maxZoneStart,
        end: maxZoneStart + maxZoneLength - 1
      });
    }

    setHourData(hours);
  }, [cities, selectedDate]);

  const getBarColor = (hour: number, overlap: number) => {
    const maxOverlap = Math.max(...hourData.map(h => h.overlap));
    if (goldilockZone && hour >= goldilockZone.start && hour <= goldilockZone.end) {
      return '#3dd68c'; // Bright green for Goldilocks zone
    }
    if (overlap === 0) return '#ffffff10';
    
    // Enhanced color gradient for better visualization
    const baseColor = '#9b87f5'; // Purple base color
    const opacity = 0.2 + (overlap / maxOverlap) * 0.8;
    return `rgba(155, 135, 245, ${opacity})`;
  };

  const getBarHeight = (overlap: number) => {
    if (overlap === 0) return 20;
    return 20 + (overlap * 35); // Scale the height based on overlap, increased effect
  };

  // Add interactivity by highlighting bars on hover
  const [activeHour, setActiveHour] = useState<number | null>(null);

  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium">Working Hours Overlap (8 AM - 9 PM)</h3>
      </div>
      
      <div className="h-[300px] w-full">
        <ChartContainer config={{
          hour: {
            theme: {
              light: "#FFFFFF",
              dark: "#FFFFFF",
            },
            label: "Hour",
          },
          overlap: {
            theme: {
              light: "#FFFFFF",
              dark: "#FFFFFF",
            },
            label: "Cities Available",
          }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={hourData} 
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              onMouseMove={(data) => {
                if (data.activeTooltipIndex !== undefined) {
                  setActiveHour(data.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setActiveHour(null)}
            >
              <XAxis 
                dataKey="displayHour" 
                tick={{ fill: '#ffffff80' }} 
                axisLine={{ stroke: '#ffffff40' }}
                tickLine={{ stroke: '#ffffff40' }}
              />
              
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value}`}
                    formatter={(value, name, { payload }) => (
                      <div>
                        <div className="mb-2 font-medium">{payload.displayHour}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-bold">{payload.overlap}</span> cities available:<br/>
                          <span className="text-sm text-white/70">{payload.cities.join(', ')}</span>
                        </div>
                      </div>
                    )}
                  />
                }
              />

              <Bar 
                dataKey="overlap" 
                fill="#8884d8"
                minPointSize={20}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              >
                {hourData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.hour, entry.overlap)}
                    height={getBarHeight(entry.overlap)}
                    className={`transition-all duration-300 ${activeHour === index ? 'filter drop-shadow-lg scale-y-105' : ''}`}
                    stroke={activeHour === index || (goldilockZone && index >= goldilockZone.start && index <= goldilockZone.end) ? '#ffffff' : 'transparent'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {goldilockZone && (
        <div className="mt-6 p-4 bg-[#1A1F2C] border border-[#9b87f5]/30 rounded-lg transition-all duration-300 hover:border-[#9b87f5]/50">
          <p className="text-lg font-medium">
            <span className="text-[#3dd68c] font-bold">✓ Best meeting window: </span>
            {hourData[goldilockZone.start].displayHour} - {hourData[goldilockZone.end < 23 ? goldilockZone.end + 1 : 0].displayHour}
          </p>
          <p className="text-sm text-white/60 mt-2">
            This time range works well for {cities.length} {cities.length === 1 ? 'location' : 'locations'}, 
            keeping the call within 8 AM - 9 PM for everyone.
          </p>
        </div>
      )}
    </div>
  );
};
