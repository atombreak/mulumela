'use client';
import React from 'react';
import { Bell } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header: React.FC = () => {
    return (
    <div className="bg-white border-b border-gray-200">
      {/* Top Row - Menu Button and Profile */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left Side - Menu Button */}
        <div className="flex items-center">
          <SidebarTrigger className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-target" />
        </div>

        {/* Right Side - Notifications and Profile */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-500 hover:text-gray-900 touch-target">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>

          {/* User Profile */}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 sm:w-10 sm:h-10',
                userButtonPopoverCard: 'shadow-lg border border-gray-200',
                userButtonPopoverActions: 'text-gray-700',
              },
            }}
            afterSignOutUrl="/auth/signin"
          />
        </div>
      </div>
    </div>
  );
};

export default Header; 