
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { BestTimeHeader } from './time-scale/BestTimeHeader';
import { ChartContainer, ChartTooltipContent } from './ui/chart';

interface TimeScaleGraphProps {
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

export const TimeScaleGraph = ({
  timeZoneData,
  bestTimeRange,
  defaultLocation,
  timeZoneName,
  currentDate
}: TimeScaleGraphProps) => {
  if (timeZoneData.length > 4) {
    return (
      <div className="glass-card p-6 animate-fade-up">
        <p className="text-white text-center">Please select 4 or fewer cities for optimal display.</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = Array.from({ length: 24 }, (_, hour) => {
    const hourData: any = { hour: `${hour.toString().padStart(2, '0')}:00` };
    
    timeZoneData.forEach(city => {
      // For each city, check if this hour is a working hour in their timezone
      const cityLocalHour = (hour + city.offset + 24) % 24;
      const isWorkingHour = cityLocalHour >= 8 && cityLocalHour <= 21;
      
      // Mark as 1 if it's a working hour, 0 if not
      hourData[city.city] = isWorkingHour ? 1 : 0;
      
      // Mark best time
      if (bestTimeRange && hour === bestTimeRange.utcHour) {
        hourData.bestTime = city.city;
      }
    });
    
    return hourData;
  });

  // Sort cities to put default location first
  const sortedCities = [...timeZoneData].sort((a, b) => {
    if (a.city === defaultLocation) return -1;
    if (b.city === defaultLocation) return 1;
    return a.city.localeCompare(b.city);
  });

  // Custom colors for each city
  const cityColors = [
    'url(#gradientStroke)',
    '#FF4E9B',
    '#A050F8',
    '#2AC4F2'
  ];

  return (
    <div className="glass-card p-6 animate-fade-up backdrop-blur-md">
      {bestTimeRange && defaultLocation && (
        <BestTimeHeader 
          bestTimeRange={bestTimeRange}
          currentDate={currentDate}
          timeZoneName={timeZoneName}
        />
      )}

      <div className="w-full">
        <svg width="0" height="0">
          <defs>
            <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD93B" />
              <stop offset="25%" stopColor="#FF8A00" />
              <stop offset="50%" stopColor="#FF4E9B" />
              <stop offset="75%" stopColor="#A050F8" />
              <stop offset="100%" stopColor="#2AC4F2" />
            </linearGradient>
          </defs>
        </svg>
        
        <ChartContainer className="h-[300px] mt-6" config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
              barSize={8}
              barGap={1}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="hour" 
                tickLine={false}
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                interval={1}
              />
              <YAxis 
                hide 
                domain={[0, 1]} 
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const workingCities = payload
                      .filter(p => p.value === 1)
                      .map(p => p.name);
                    
                    const isBestTime = chartData.find(d => d.hour === label)?.bestTime;
                    
                    return (
                      <div className="bg-black/80 border border-white/20 p-3 rounded shadow">
                        <p className="text-white font-medium mb-1">{label}</p>
                        {workingCities.length > 0 ? (
                          <>
                            <p className="text-white/70 text-xs mb-1">Working hours for:</p>
                            <ul className="text-xs">
                              {workingCities.map(city => (
                                <li key={city} className="text-white/90 flex items-center gap-1">
                                  {city === defaultLocation && (
                                    <span className="gradient-text">● </span>
                                  )}
                                  {city}
                                  {isBestTime === city && (
                                    <span className="text-yellow-400 ml-1">✓ Best time</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="text-white/70 text-xs">No working hours</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {sortedCities.map((city, index) => (
                <Bar 
                  key={city.city} 
                  dataKey={city.city}
                  name={city.city}
                  fill={cityColors[index % cityColors.length]}
                  radius={[2, 2, 0, 0]}
                  stackId="stack"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      opacity={entry[city.city] === 1 ? 1 : 0.1}
                      strokeWidth={entry.bestTime === city.city ? 2 : 0}
                      stroke="#FFD93B"
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        {sortedCities.map((city, i) => (
          <div key={city.city} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ background: cityColors[i % cityColors.length] }}
            ></div>
            <span className={city.city === defaultLocation ? "gradient-text" : "text-white/80"}>
              {city.city} 
              {city.city === defaultLocation && <span className="text-xs ml-1">(Current)</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-white/60 flex justify-center">
        <span>All times shown in your local time zone ({timeZoneName})</span>
      </div>
    </div>
  );
};
