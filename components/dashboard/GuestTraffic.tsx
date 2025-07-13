import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TrafficData {
  time: string;
  total: number;
  male: number;
  female: number;
}

const GuestTraffic = () => {
  const trafficData: TrafficData[] = [
    { time: '10 min', total: 60, male: 30, female: 30 },
    { time: '20 min', total: 80, male: 40, female: 40 },
    { time: '40 min', total: 100, male: 60, female: 40 },
    { time: '60 min', total: 85, male: 45, female: 40 },
    { time: '80 min', total: 70, male: 35, female: 35 },
    { time: '120 min', total: 90, male: 50, female: 40 },
    { time: '140 min', total: 65, male: 30, female: 35 }
  ];

  const maxValue = Math.max(...trafficData.map(d => d.total));

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 mobile-shadow">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Guest Traffic</h2>
        <button className="text-gray-500 hover:text-gray-700 text-sm font-medium active:text-gray-900 native-transition touch-target">
          See more
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
          <span className="text-xs sm:text-sm text-gray-600">Total guest</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
          <span className="text-xs sm:text-sm text-gray-600">Male guest</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
          <span className="text-xs sm:text-sm text-gray-600">Female guest</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48 sm:h-64 overflow-x-auto">
        <div className="flex items-end justify-between h-full px-2 sm:px-4 min-w-full">
          {trafficData.map((data, index) => (
            <div key={index} className="flex flex-col items-center cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
              <div className="flex flex-col items-center mb-2 sm:mb-3">
                {/* Stacked Bars */}
                <div className="w-4 sm:w-6 flex flex-col items-center space-y-0.5">
                  {/* Total guest bar */}
                  <div
                    className="w-full bg-gray-800 rounded-sm transition-all duration-300"
                    style={{
                      height: `${(data.total / maxValue) * 180}px`,
                      minHeight: '6px'
                    }}
                  ></div>
                  
                  {/* Male guest bar */}
                  <div
                    className="w-full bg-teal-400 rounded-sm transition-all duration-300"
                    style={{
                      height: `${(data.male / maxValue) * 140}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  
                  {/* Female guest bar */}
                  <div
                    className="w-full bg-purple-400 rounded-sm transition-all duration-300"
                    style={{
                      height: `${(data.female / maxValue) * 120}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Time label */}
              <span className="text-xs text-gray-500 font-medium">{data.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center space-x-4 mt-4 sm:mt-6">
        <button className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full native-transition touch-target">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <button className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full native-transition touch-target">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default GuestTraffic; 