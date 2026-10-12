import React, { useState } from 'react';
import { DailyPerformancePoint } from '../types/dayledger';

interface CorporateTrendChartProps {
  points: DailyPerformancePoint[];
}

export const CorporateTrendChart: React.FC<CorporateTrendChartProps> = ({ points }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const inspected = selectedIndex !== null ? points[selectedIndex] : points[points.length - 1];

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 15;
  const paddingRight = 15;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;

  const pointCoords = points.map((p, idx) => {
    const x = paddingLeft + idx * stepX;
    const normalizedY = Math.min(Math.max(p.completionRate / 100, 0), 1);
    const y = paddingTop + (1 - normalizedY) * chartHeight;
    return { x, y, point: p, index: idx };
  });

  // Build smooth cubic bezier path
  let strokePath = '';
  if (pointCoords.length > 0) {
    strokePath = `M ${pointCoords[0].x} ${pointCoords[0].y}`;
    for (let i = 0; i < pointCoords.length - 1; i++) {
      const p0 = pointCoords[i];
      const p1 = pointCoords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      strokePath += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Area path
  let areaPath = '';
  if (pointCoords.length > 0) {
    const bottomY = paddingTop + chartHeight;
    areaPath = `${strokePath} L ${pointCoords[pointCoords.length - 1].x} ${bottomY} L ${pointCoords[0].x} ${bottomY} Z`;
  }

  const gridLevels = [1.0, 0.75, 0.5, 0.25, 0.0];

  return (
    <div
      data-testid="corporate_trend_chart_card"
      className="w-full bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1E293B] p-4 shadow-xs"
    >
      {/* Header & Tooltip */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            30-DAY PERFORMANCE TRAJECTORY
          </h3>
          <p className="text-xs text-slate-800 dark:text-slate-200">
            Daily Completion Percentage Trend
          </p>
        </div>

        {inspected && (
          <div
            data-testid="chart_tooltip_pill"
            className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold"
          >
            {inspected.shortLabel} ({inspected.dayOfWeek}): {Math.round(inspected.completionRate)}% ({inspected.completedCount}/{inspected.totalCount})
          </div>
        )}
      </div>

      {/* SVG Canvas Area */}
      {points.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 cursor-crosshair select-none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {gridLevels.map((lvl, idx) => {
              const y = paddingTop + (1 - lvl) * chartHeight;
              return (
                <line
                  key={idx}
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-[#1E293B]"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Gradient Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

            {/* Smooth Stroke Line */}
            {strokePath && (
              <path
                d={strokePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-xs"
              />
            )}

            {/* Points and interaction nodes */}
            {pointCoords.map((pt, i) => {
              const isSelected = selectedIndex === i || (selectedIndex === null && i === pointCoords.length - 1);
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onClick={() => setSelectedIndex(i)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  {/* Invisible hit target for smooth mouse/touch hover */}
                  <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />

                  {isSelected ? (
                    <>
                      {/* Pulse ring */}
                      <circle cx={pt.x} cy={pt.y} r="8" fill="#2563EB" fillOpacity="0.25" />
                      {/* Solid node */}
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#2563EB" />
                      <circle cx={pt.x} cy={pt.y} r="2.5" fill="#FFFFFF" />
                    </>
                  ) : (
                    (i % 5 === 0 || i === pointCoords.length - 1) && (
                      <circle cx={pt.x} cy={pt.y} r="3" fill="#2563EB" />
                    )
                  )}
                </g>
              );
            })}

            {/* X-Axis labels */}
            {pointCoords.map((pt, i) => {
              const step = Math.max(Math.floor(points.length / 5), 1);
              const isLabel = i % step === 0 || i === pointCoords.length - 1;
              if (!isLabel) return null;
              return (
                <text
                  key={`label-${i}`}
                  x={pt.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {pt.point.shortLabel}
                </text>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="h-36 flex items-center justify-center text-xs text-slate-400">
          Collecting 30-day timeline data points...
        </div>
      )}

      {/* Footer Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1E293B]/60 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>Calculated Execution Ratio</span>
        </div>

        <span className="font-semibold text-blue-600 dark:text-blue-400 text-[11px]">
          Tap or hover node to inspect
        </span>
      </div>
    </div>
  );
};
