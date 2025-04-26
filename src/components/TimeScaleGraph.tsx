
import { useState, useEffect } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface TimeScaleGraphProps {
  cities: string[];
}

interface HourData {
  hour: number;
  displayHour: string;
  overlap: number;
  cities: string[];
}

export const TimeScaleGraph = ({ cities }: TimeScaleGraphProps) => {
  const [hourData, setHourData] = useState<HourData[]>([]);
  const [goldilockZone, setGoldilockZone] = useState<{start: number; end: number} | null>(null);

  useEffect(() => {
    if (!cities || cities.length === 0) return;
    
    // Create 24-hour data points
    const hours: HourData[] = Array.from({ length: 24 }, (_, i) => {
      const date = new Date();
      date.setHours(i, 0, 0, 0);
      return {
        hour: i,
        displayHour: format(date, 'h a'),
        overlap: 0,
        cities: []
      };
    });

    // Simple simulation of working hours (7 AM to 10 PM) for each city
    // In a real app, this would use proper time zone conversion for each city
    cities.forEach(city => {
      // For this demo, we'll just simulate some time differences
      let offset = 0;
      
      // Simulate different time zones (this would be replaced with real time zone data)
      if (city.toLowerCase().includes('new york')) offset = 0;
      else if (city.toLowerCase().includes('london')) offset = 5;
      else if (city.toLowerCase().includes('tokyo')) offset = 13;
      else if (city.toLowerCase().includes('sydney')) offset = 15;
      else if (city.toLowerCase().includes('paris')) offset = 6;
      else if (city.toLowerCase().includes('dubai')) offset = 9;
      else if (city.toLowerCase().includes('singapore')) offset = 12;
      else if (city.toLowerCase().includes('los angeles')) offset = -3;
      else if (city.toLowerCase().includes('san francisco')) offset = -3;
      else if (city.toLowerCase().includes('beijing')) offset = 13;
      // Random offset for other cities
      else offset = Math.floor(Math.random() * 24);

      // Mark working hours (7 AM to 10 PM) for this city
      for (let h = 7; h <= 22; h++) {
        const adjustedHour = (h + offset) % 24;
        hours[adjustedHour].overlap += 1;
        hours[adjustedHour].cities.push(city);
      }
    });

    // Find the Goldilocks zone (best overlap)
    let bestOverlapStart = -1;
    let bestOverlapEnd = -1;
    let maxOverlap = 0;
    let bestOverlapHours: number[] = [];

    // Find max overlap
    hours.forEach(hour => {
      if (hour.overlap > maxOverlap) {
        maxOverlap = hour.overlap;
        bestOverlapHours = [hour.hour];
      } else if (hour.overlap === maxOverlap && maxOverlap > 0) {
        bestOverlapHours.push(hour.hour);
      }
    });

    // Find consecutive hours with max overlap
    if (bestOverlapHours.length > 0) {
      bestOverlapHours.sort((a, b) => a - b);
      
      let currentStart = bestOverlapHours[0];
      let currentEnd = bestOverlapHours[0];
      let longestStart = currentStart;
      let longestEnd = currentStart;
      
      for (let i = 1; i < bestOverlapHours.length; i++) {
        if (bestOverlapHours[i] === currentEnd + 1) {
          // Consecutive hour
          currentEnd = bestOverlapHours[i];
        } else {
          // Non-consecutive
          if (currentEnd - currentStart > longestEnd - longestStart) {
            longestStart = currentStart;
            longestEnd = currentEnd;
          }
          currentStart = bestOverlapHours[i];
          currentEnd = bestOverlapHours[i];
        }
      }
      
      // Check the last range
      if (currentEnd - currentStart > longestEnd - longestStart) {
        longestStart = currentStart;
        longestEnd = currentEnd;
      }
      
      bestOverlapStart = longestStart;
      bestOverlapEnd = longestEnd;
    }

    setHourData(hours);
    setGoldilockZone(bestOverlapStart !== -1 ? { start: bestOverlapStart, end: bestOverlapEnd } : null);
  }, [cities]);

  if (!cities || cities.length === 0 || !goldilockZone) {
    return null;
  }

  const config = {
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
    },
    goldilocks: {
      label: "Best Time",
      theme: {
        light: "#3dd68c",
        dark: "#3dd68c",
      },
    }
  };

  const getBarColor = (hour: number) => {
    if (goldilockZone && hour >= goldilockZone.start && hour <= goldilockZone.end) {
      return '#3dd68c'; // Green for Goldilocks zone
    }
    return '#ffffff20'; // Semi-transparent white for other times
  };

  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium">Goldilocks Zone - Best Time for Everyone</h3>
      </div>
      
      <div className="h-[200px] w-full">
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <XAxis 
                dataKey="displayHour" 
                tick={{ fill: '#ffffff80' }} 
                axisLine={{ stroke: '#ffffff20' }}
                tickLine={{ stroke: '#ffffff20' }}
              />
              
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value}`}
                    formatter={(value, name, { payload }) => (
                      <div>
                        <div className="mb-2 font-medium">{payload.displayHour}</div>
                        <div className="text-sm text-muted-foreground">{payload.cities.join(', ')}</div>
                      </div>
                    )}
                  />
                }
              />

              <Bar dataKey="overlap" fill="#8884d8">
                {hourData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.hour)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {goldilockZone && (
        <div className="mt-4">
          <p className="text-lg font-medium">
            <span className="text-[#3dd68c]">Best meeting time: </span>
            {hourData[goldilockZone.start].displayHour} - {hourData[goldilockZone.end < 23 ? goldilockZone.end + 1 : 0].displayHour}
          </p>
        </div>
      )}
    </div>
  );
};
