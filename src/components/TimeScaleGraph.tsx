
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

    // Working hours (8 AM to 9 PM) for each city
    cities.forEach(city => {
      let offset = 0;
      
      // Simulate different time zones
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
      setGoldilockZone({
        start: sortedHours[0].hour,
        end: sortedHours[sortedHours.length - 1].hour
      });
    }

    setHourData(hours);
  }, [cities]);

  const getBarColor = (hour: number) => {
    if (goldilockZone && hour >= goldilockZone.start && hour <= goldilockZone.end) {
      return '#3dd68c'; // Bright green for Goldilocks zone
    }
    return '#ffffff20'; // Semi-transparent white for other times
  };

  const getBarHeight = (overlap: number) => {
    if (overlap === 0) return 20;
    return 20 + (overlap * 30); // Scale the height based on overlap
  };

  return (
    <div className="glass-card p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-white/60" />
        <h3 className="text-xl font-medium">Working Hours Overlap (8 AM - 9 PM)</h3>
      </div>
      
      <div className="h-[250px] w-full">
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
            >
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
                        <div className="text-sm text-muted-foreground">
                          Available cities: {payload.cities.join(', ')}
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
              >
                {hourData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.hour)}
                    height={getBarHeight(entry.overlap)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {goldilockZone && (
        <div className="mt-4">
          <p className="text-lg font-medium">
            <span className="text-[#3dd68c]">Best meeting window: </span>
            {hourData[goldilockZone.start].displayHour} - {hourData[goldilockZone.end < 23 ? goldilockZone.end + 1 : 0].displayHour}
          </p>
        </div>
      )}
    </div>
  );
};
