'use client';

import React from 'react';

export default function TrustScoreRing({ score, size = 60, strokeWidth = 5 }: { score: number, size?: number, strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 5) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 4.5) return '#10B981'; // Green
    if (s >= 4.0) return '#FCD34D'; // Yellow
    if (s >= 3.5) return '#FB923C'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-black text-gray-900">{score.toFixed(1)}</span>
    </div>
  );
}
