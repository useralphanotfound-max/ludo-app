'use client';

import React from 'react';

export default function GlassCard({ children, style = {}, className = '', onClick }) {
  return (
    <div
      className={`glass-panel ${className}`}
      onClick={onClick}
      style={{
        padding: '1.25rem',
        ...style
      }}
    >
      {children}
    </div>
  );
}
