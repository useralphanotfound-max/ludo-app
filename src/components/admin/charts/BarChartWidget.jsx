'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function BarChartWidget({
  data = [],
  xKey = 'name',
  bars = [{ key: 'value', color: '#10b981', name: 'Volume' }],
  height = 240,
  formatY = (v) => v
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No analytics data available for selected range
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey={xKey} stroke="#64748b" fontSize={11} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatY} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111624',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '12px'
          }}
        />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />}
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name || b.key} fill={b.color || '#10b981'} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
