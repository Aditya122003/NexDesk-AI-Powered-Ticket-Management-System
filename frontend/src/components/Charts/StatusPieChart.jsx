import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#047857', '#b45309', '#1d4ed8'];

const CustomPieTooltip = ({ active, payload }) => {
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
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: data.fill || '#047857' }}></span>
          <span>{data.name}:</span>
          <span style={{ color: '#0f172a', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 900 }}>
            {data.value} Tickets
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const StatusPieChart = ({ data, showLabels = true }) => {
  const chartData = data && data.length > 0 ? data : [
    { status: 'Open', count: 3 },
    { status: 'In Progress', count: 2 },
    { status: 'Resolved', count: 7 }
  ];

  const total = chartData.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', height: 230, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="count"
              nameKey="status"
              cornerRadius={6}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
              animationBegin={0}
              label={showLabels ? ({ status, count }) => `${status}: ${count}` : false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>Total</div>
        </div>
      </div>

      {/* Custom Legend Badges - Fitted Cleanly Inside Card */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', width: '100%' }}>
        {chartData.map((item, idx) => {
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
          return (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }}></span>
              <span>{item.status || item._id}: <strong>{item.count}</strong> ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusPieChart;
