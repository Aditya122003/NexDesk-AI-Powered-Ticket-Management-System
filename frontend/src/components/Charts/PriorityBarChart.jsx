import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts';

const PRIORITY_COLORS = {
  Low: '#10b981',
  Medium: '#3b82f6',
  High: '#f59e0b',
  Urgent: '#ef4444'
};

const CustomPriorityTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = PRIORITY_COLORS[label] || '#032d1f';
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '8px 14px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '1.5px solid #cbd5e1',
          fontSize: '0.875rem',
          fontWeight: 800
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }}></span>
          <span>Priority ({label}):</span>
          <span style={{ color: '#0f172a', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 900 }}>
            {data.value} Tickets
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const PriorityBarChart = ({ data, showLabels = true }) => {
  const chartData = data && data.length > 0 ? data : [
    { priority: 'Low', count: 2 },
    { priority: 'Medium', count: 4 },
    { priority: 'High', count: 3 },
    { priority: 'Urgent', count: 1 }
  ];

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="priority" stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomPriorityTooltip />} />
          <Bar
            dataKey="count"
            radius={[10, 10, 0, 0]}
            barSize={40}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
            animationBegin={0}
          >
            {showLabels && <LabelList dataKey="count" position="top" fill="#0f172a" fontSize={12} fontWeight={800} />}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#032d1f'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriorityBarChart;
