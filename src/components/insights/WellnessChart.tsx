import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

interface WellnessDataPoint {
  date: Date;
  score: number;
  label?: string;
}

interface WellnessChartProps {
  data: WellnessDataPoint[];
  title?: string;
}

const moodToScore = {
  very_bad: 20,
  bad: 40,
  neutral: 60,
  good: 80,
  very_good: 100,
};

export default function WellnessChart({ data, title = 'Wellness Trend' }: WellnessChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    date: format(point.date, 'MMM d'),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-2xl shadow-xl border border-border px-4 py-3">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-lg font-black text-primary">
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[32px] p-8 border border-border shadow-xl shadow-primary/5">
      <h3 className="text-xl font-black text-text mb-8">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#7f8c8d', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 10, fill: '#7f8c8d', fontWeight: 600 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--color-primary))"
              strokeWidth={3}
              fill="url(#colorScore)"
              dot={{ r: 5, fill: 'white', strokeWidth: 2, stroke: 'hsl(var(--color-primary))' }}
              activeDot={{ r: 7, fill: 'hsl(var(--color-primary))', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Past 30 Days</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs font-bold text-text">Wellness Score</span>
        </div>
      </div>
    </div>
  );
}

export { moodToScore };
