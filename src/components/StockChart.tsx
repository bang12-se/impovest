import React, { useState, useMemo, useRef, useEffect } from "react";
import { Stock } from "../types";
import { generateChartData, ChartDataPoint } from "../utils/stockData";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface StockChartProps {
  stock: Stock;
}

export default function StockChart({ stock }: StockChartProps) {
  const [period, setPeriod] = useState<"1D" | "1W" | "1M" | "1Y">("1D");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  const chartData = useMemo(() => {
    return generateChartData(stock, period);
  }, [stock, period]);

  // Adjust SVG width dynamically on mount/resize
  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartData]);

  const { min, max, pointsString, gradientString, mappedPoints } = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, pointsString: "", gradientString: "", mappedPoints: [] };
    }

    const prices = chartData.map(d => d.price);
    const maxVal = Math.max(...prices);
    const minVal = Math.min(...prices);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    // Grid details
    const paddingY = 40;
    const paddingX = 20;
    const height = 280;
    const svgWidth = width;

    const mapped = chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1)) * (svgWidth - paddingX * 2);
      // Invert Y because SVG coordinates start from top-left (0,0)
      const y = paddingY + (1 - (d.price - minVal) / range) * (height - paddingY * 2);
      return { x, y, data: d };
    });

    const path = mapped.map(p => `${p.x},${p.y}`).join(" ");
    
    // Gradient points closing path
    const firstX = mapped[0].x;
    const lastX = mapped[mapped.length - 1].x;
    const bottomY = height;
    const gradPath = `${firstX},${bottomY} ${path} ${lastX},${bottomY}`;

    return {
      min: minVal,
      max: maxVal,
      pointsString: path,
      gradientString: gradPath,
      mappedPoints: mapped
    };
  }, [chartData, width]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!mappedPoints.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find closest point by X coordinate
    let closest = mappedPoints[0];
    let minDistance = Math.abs(closest.x - mouseX);

    for (let i = 1; i < mappedPoints.length; i++) {
      const dist = Math.abs(mappedPoints[i].x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closest = mappedPoints[i];
      }
    }

    setHoveredPoint(closest.data);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const isPositive = stock.change >= 0;
  const strokeColor = isPositive ? "#10b981" : "#f43f5e"; // emerald-500 or rose-500
  const fillColorId = `grad-${stock.symbol}-${period}`;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md" id={`chart-${stock.symbol}`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            <span>시세 분석 차트</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight" id="chart-current-price">
              {hoveredPoint 
                ? `${hoveredPoint.price.toLocaleString()}${stock.currency === "KRW" ? "원" : " USD"}`
                : `${stock.currentPrice.toLocaleString()}${stock.currency === "KRW" ? "원" : " USD"}`
              }
            </span>
            <span className={`flex items-center text-sm font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`} id="chart-price-change">
              {isPositive ? <TrendingUp className="h-4 w-4 mr-0.5" /> : <TrendingDown className="h-4 w-4 mr-0.5" />}
              {isPositive ? "+" : ""}{stock.change.toLocaleString()}({stock.changePercent}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {hoveredPoint ? `선택 시점: ${hoveredPoint.time}` : "현재 기준 가격 (정상 동작 중)"}
          </p>
        </div>

        {/* Period Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl self-start border border-slate-800/80">
          {(["1D", "1W", "1M", "1Y"] as const).map(p => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setHoveredPoint(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === p
                  ? "bg-slate-800 text-emerald-400 border-b-2 border-emerald-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id={`btn-chart-period-${p}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full h-[280px] select-none">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} 280`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={fillColorId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="40" x2={width} y2="40" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1="140" x2={width} y2="140" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1="240" x2={width} y2="240" stroke="#1e293b" strokeDasharray="4 4" />

          {/* Chart Paths */}
          {pointsString && (
            <>
              {/* Shaded Area */}
              <polyline
                fill={`url(#${fillColorId})`}
                points={gradientString}
                className="transition-all duration-300 ease-out"
              />
              {/* Line stroke */}
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                points={pointsString}
                className="transition-all duration-300 ease-out"
              />
            </>
          )}

          {/* Interactive cursor line */}
          {hoveredPoint && (
            (() => {
              const pt = mappedPoints.find(p => p.data.time === hoveredPoint.time);
              if (!pt) return null;
              return (
                <g>
                  <line
                    x1={pt.x}
                    y1="0"
                    x2={pt.x}
                    y2="280"
                    stroke="#475569"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    fill={strokeColor}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                </g>
              );
            })()
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute top-2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs shadow-xl pointer-events-none transition-all duration-75 z-20"
            style={{
              left: `${Math.min(
                Math.max(
                  mappedPoints.find(p => p.data.time === hoveredPoint.time)?.x || 0 - 60, 
                  10
                ), 
                width - 130
              )}px`
            }}
          >
            <div className="text-slate-500 font-medium">{hoveredPoint.time}</div>
            <div className="text-slate-100 font-bold mt-0.5">
              {hoveredPoint.price.toLocaleString()}
              <span className="text-slate-400 font-normal ml-0.5">{stock.currency === "KRW" ? "원" : " USD"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Axis/Legend labels */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2 border-t border-slate-800/60 pt-3">
        <span>{chartData[0]?.time || "Start"}</span>
        <span className="flex items-center gap-1.5 text-slate-600 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800/30">
          최고 {max.toLocaleString()} / 최저 {min.toLocaleString()}
        </span>
        <span>{chartData[chartData.length - 1]?.time || "End"}</span>
      </div>
    </div>
  );
}
