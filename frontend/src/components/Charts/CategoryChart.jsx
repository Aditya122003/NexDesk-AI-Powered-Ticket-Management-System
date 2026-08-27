import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts';

const CATEGORY_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#94a3b8'];

const CustomCategoryTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
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
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: data.color || '#6366f1' }}></span>
          <span>Category ({label}):</span>
          <span style={{ color: '#0f172a', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 900 }}>
            {data.value} Tickets
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CategoryChart = ({ data, showLabels = true }) => {
  const chartData = data && data.length > 0 ? data : [
    { category: 'Technical', count: 5 },
    { category: 'Billing', count: 2 },
    { category: 'Account', count: 3 },
    { category: 'Feature', count: 2 },
    { category: 'General', count: 1 }
  ];

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
          <YAxis dataKey="category" type="category" stroke="#0f172a" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} width={90} />
          <Tooltip content={<CustomCategoryTooltip />} />
          <Bar
            dataKey="count"
            radius={[0, 10, 10, 0]}
            barSize={22}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
            animationBegin={0}
          >
            {showLabels && <LabelList dataKey="count" position="right" fill="#0f172a" fontSize={12} fontWeight={800} />}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
