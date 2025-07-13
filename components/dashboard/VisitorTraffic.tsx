import React from 'react';

const VisitorTraffic = () => {
  // Mock data points for the line chart
  const dataPoints = [
    { x: 20, y: 120 },
    { x: 40, y: 80 },
    { x: 60, y: 100 },
    { x: 80, y: 110 },
    { x: 100, y: 70 },
    { x: 120, y: 85 },
    { x: 140, y: 95 },
    { x: 160, y: 60 },
    { x: 180, y: 75 },
    { x: 200, y: 90 },
    { x: 220, y: 85 },
    { x: 240, y: 70 },
    { x: 260, y: 80 }
  ];

  // Create SVG path for the line
  const createPath = (points: typeof dataPoints) => {
    const path = points.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${acc} L ${point.x} ${point.y}`;
    }, '');
    return path;
  };

  // Create area path for the fill
  const createAreaPath = (points: typeof dataPoints) => {
    const linePath = createPath(points);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    return `${linePath} L ${lastPoint.x} 150 L ${firstPoint.x} 150 Z`;
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 h-full mobile-shadow">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Visitor traffic</h2>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">10,329</div>
      </div>

      {/* Line Chart */}
      <div className="relative h-32 sm:h-40 touch-manipulation">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 280 160"
          className="overflow-visible cursor-pointer"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#374151" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#374151" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d={createAreaPath(dataPoints)}
            fill="url(#gradient)"
            opacity="0.8"
            className="transition-opacity duration-300"
          />
          
          {/* Line */}
          <path
            d={createPath(dataPoints)}
            fill="none"
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
          
          {/* Data points */}
          {dataPoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill="#374151"
              className="hover:r-3 transition-all duration-200"
            />
          ))}
        </svg>
      </div>

      {/* Chart footer with trend indicator */}
      <div className="mt-4 sm:mt-6 flex items-center justify-between text-xs sm:text-sm text-gray-500">
        <span>Last 7 days</span>
        <div className="flex items-center space-x-1">
          <div className="w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-b-2 border-b-green-500"></div>
          <span className="text-green-600 font-medium">+12.5%</span>
        </div>
      </div>
    </div>
  );
};

export default VisitorTraffic; 