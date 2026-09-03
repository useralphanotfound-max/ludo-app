'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AreaChartWidget({
  data = [],
  xKey = 'name',
  yKey = 'value',
  color = '#10b981',
  gradientId = 'emeraldGradient',
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
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
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
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
