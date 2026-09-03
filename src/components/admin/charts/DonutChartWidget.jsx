'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DonutChartWidget({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 240,
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6']
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No distribution metrics available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
          dataKey={valueKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} stroke="rgba(0,0,0,0.5)" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#111624',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '12px'
          }}
        />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
