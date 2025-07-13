import React from 'react';

interface StatsCardProps {
  title: string;
  icon: React.ReactNode;
  totalInvites: string;
  totalCome: string;
  bgColor: string;
  textColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  icon,
  totalInvites,
  totalCome,
  bgColor,
  textColor
}) => {
  return (
    <div className={`${bgColor} ${textColor} rounded-2xl p-4 sm:p-6 flex-1 native-button mobile-shadow`}>
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black bg-opacity-15 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div>
          <p className="text-xs sm:text-sm opacity-80 mb-1 sm:mb-2">Total invites</p>
          <p className="text-2xl sm:text-3xl font-bold">{totalInvites}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm opacity-80 mb-1 sm:mb-2">Total come</p>
          <p className="text-2xl sm:text-3xl font-bold">{totalCome}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 