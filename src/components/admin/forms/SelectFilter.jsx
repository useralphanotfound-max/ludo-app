'use client';

import React from 'react';

export default function SelectFilter({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  style = {}
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="custom-input"
      style={{ minWidth: '140px', width: 'auto', fontSize: '0.8rem', cursor: 'pointer', ...style }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
