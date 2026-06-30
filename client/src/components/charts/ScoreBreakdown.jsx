import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

export const SCORE_METRICS = [
  { key: 'overallPlacementScore', label: 'Overall Placement' },
  { key: 'backendScore', label: 'Backend' },
  { key: 'frontendScore', label: 'Frontend' },
  { key: 'databaseScore', label: 'Database' },
  { key: 'githubPortfolioScore', label: 'Portfolio' },
  { key: 'documentationScore', label: 'Documentation' },
  { key: 'projectQualityScore', label: 'Project Quality' },
  { key: 'openSourceScore', label: 'Open Source' },
];

const ScoreLabel = ({ x, y, width, height, value }) => (
  <text
    x={x + width + 8}
    y={y + height / 2}
    fill="#E5E7EB"
    fontSize={12}
    fontWeight={600}
    dominantBaseline="middle"
  >
    {value}/100
  </text>
);

const ScoreBreakdown = ({ scores }) => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const updateLayout = () => setIsCompact(mediaQuery.matches);
    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);
    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  if (!scores) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No score data available</p>
      </div>
    );
  }

  const data = SCORE_METRICS.map(({ key, label }) => ({
    name: label,
    score: scores[key] ?? 0,
  }));

  const chartHeight = Math.max(300, data.length * 36);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 8,
          right: isCompact ? 48 : 56,
          left: 4,
          bottom: 24,
        }}
        barCategoryGap="22%"
      >
        <defs>
          <linearGradient id="scoreBarGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="#374151"
          strokeDasharray="3 3"
          horizontal={false}
          vertical
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tick={{ fill: '#9CA3AF', fontSize: isCompact ? 10 : 11 }}
          axisLine={{ stroke: '#4B5563' }}
          tickLine={{ stroke: '#4B5563' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={isCompact ? 88 : 108}
          tick={{ fill: '#9CA3AF', fontSize: isCompact ? 11 : 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Bar
          dataKey="score"
          fill="url(#scoreBarGradient)"
          radius={[0, 6, 6, 0]}
          barSize={isCompact ? 14 : 18}
          background={{ fill: '#374151', radius: [0, 6, 6, 0] }}
          animationDuration={800}
          animationBegin={0}
          isAnimationActive
        >
          <LabelList content={<ScoreLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ScoreBreakdown;
