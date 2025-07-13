'use client';
import React from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  timeAgo: string;
  avatar: string;
  hasActions?: boolean;
}

const RecentGuests = () => {
  const guests: Guest[] = [
    {
      id: '1',
      name: 'Aisyah Namanya',
      timeAgo: '2 minute ago',
      avatar: '/api/placeholder/40/40',
      hasActions: true
    },
    {
      id: '2',
      name: 'Cak Handoko',
      timeAgo: '6 minute ago',
      avatar: '/api/placeholder/40/40',
      hasActions: true
    },
    {
      id: '3',
      name: 'Bu Lek Mina',
      timeAgo: '20 minute ago',
      avatar: '/api/placeholder/40/40',
      hasActions: true
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-pink-400 to-purple-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-teal-400',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 mobile-shadow">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recently Guest</h2>
        <button className="text-gray-500 hover:text-gray-700 text-sm font-medium active:text-gray-900 native-transition touch-target">
          See more
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {guests.map((guest, index) => (
          <div key={guest.id} className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg native-transition cursor-pointer touch-target">
            {/* Avatar */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img
                src={guest.avatar}
                alt={guest.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.removeAttribute('style');
                }}
              />
              <div 
                className={`w-full h-full bg-gradient-to-br ${getAvatarColor(index)} flex items-center justify-center text-white text-sm font-medium`}
                style={{display: 'none'}}
              >
                {getInitials(guest.name)}
              </div>
            </div>

            {/* Guest Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{guest.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{guest.timeAgo}</p>
            </div>

            {/* Actions */}
            {guest.hasActions && (
              <div className="flex items-center space-x-2">
                {index === 1 && (
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-purple-100 rounded-lg p-1.5 sm:p-2">
                    <button className="text-purple-600 hover:text-purple-700 active:text-purple-800 transition-colors p-1">
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-700 active:text-purple-800 transition-colors p-1">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
                {index !== 1 && (
                  <button className="text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors p-1">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentGuests; 