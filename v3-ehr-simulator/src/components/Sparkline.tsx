'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: Array<{ time: string; value: number }>;
  status?: 'critical' | 'warning' | 'normal';
  height?: number;
}

const statusColors: Record<string, string> = {
  critical: '#ef4444',
  warning: '#f59e0b',
  normal: '#4f46e5',
};

export function Sparkline({ data, status = 'normal', height = 24 }: SparklineProps) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={statusColors[status] || statusColors.normal}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
