import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '10px 14px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '1.5px solid #cbd5e1',
          fontSize: '0.875rem'
        }}
      >
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>
          Date: {label}
        </div>
        <div style={{ color: '#d97706', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Total Created:</span>
          <span style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fde68a', fontWeight: 900 }}>
            {payload[0]?.value}
          </span>
        </div>
        {payload[1] && (
          <div style={{ color: '#059669', fontWeight: 800, fontSize: '0.9rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Resolved:</span>
            <span style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', fontWeight: 900 }}>
              {payload[1]?.value}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const TrendLineChart = ({ data, chartType = 'bar', showLabels = true }) => {
  const chartData = data && data.length > 0 ? data : [
    { date: 'Mon', total: 4, resolved: 3 },
    { date: 'Tue', total: 7, resolved: 5 },
    { date: 'Wed', total: 5, resolved: 4 },
    { date: 'Thu', total: 9, resolved: 8 },
    { date: 'Fri', total: 12, resolved: 10 },
    { date: 'Sat', total: 8, resolved: 7 },
    { date: 'Sun', total: 14, resolved: 12 }
  ];

  return (
    <div style={{ width: '100%', height: 350, marginTop: '0.5rem' }}>
      <ResponsiveContainer>
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }} barGap={6} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '15px', fontSize: '0.85rem', fontWeight: 800 }}
            />
            <Bar
              dataKey="total"
              name="Total Tickets Created"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
              animationBegin={0}
            >
              {showLabels && <LabelList dataKey="total" position="top" fill="#d97706" fontSize={11} fontWeight={800} />}
            </Bar>
            <Bar
              dataKey="resolved"
              name="Tickets Resolved"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
              animationBegin={0}
            >
              {showLabels && <LabelList dataKey="resolved" position="top" fill="#047857" fontSize={11} fontWeight={800} />}
            </Bar>
          </BarChart>
        ) : chartType === 'line' ? (
          <LineChart data={chartData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '15px', fontSize: '0.85rem', fontWeight: 800 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total Tickets Created"
              stroke="#f59e0b"
              strokeWidth={3.5}
              dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
              animationBegin={0}
            >
              {showLabels && <LabelList dataKey="total" position="top" fill="#d97706" fontSize={11} fontWeight={800} />}
            </Line>
            <Line
              type="monotone"
              dataKey="resolved"
              name="Tickets Resolved"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
              animationBegin={0}
            >
              {showLabels && <LabelList dataKey="resolved" position="top" fill="#047857" fontSize={11} fontWeight={800} />}
            </Line>
          </LineChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorTotalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorResolvedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '15px', fontSize: '0.85rem', fontWeight: 800 }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Tickets Created"
              stroke="#f59e0b"
              strokeWidth={3.5}
              fillOpacity={1}
              fill="url(#colorTotalGradient)"
              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 7, fill: '#f59e0b', strokeWidth: 3, stroke: '#ffffff' }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
              animationBegin={0}
            >
              {showLabels && <LabelList dataKey="total" position="top" fill="#d97706" fontSize={11} fontWeight={800} />}
            </Area>
            <Area
              type="monotone"
              dataKey="resolved"
              name="Tickets Resolved"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorResolvedGradient)"
              strokeDasharray="4 4"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
              animationBegin={0}
            >
              {showLabels && <LabelList dataKey="resolved" position="top" fill="#047857" fontSize={11} fontWeight={800} />}
            </Area>
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default TrendLineChart;
