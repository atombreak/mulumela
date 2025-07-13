'use client';
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Gift, 
  User, 
  Wallet, 
  HelpCircle, 
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Calendar
} from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  useSidebar,
} from '@/components/ui/sidebar';

const VorgezSidebar = () => {
  const { setOpenMobile, toggleSidebar, state } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      {/* Logo */}
      <SidebarHeader className="p-6 group-data-[collapsible=icon]:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center space-x-2 group-data-[collapsible=icon]:space-x-0">
            <span className="text-2xl font-bold text-gray-900 group-data-[collapsible=icon]:hidden">Mulumela</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:text-white group-data-[collapsible=icon]:text-sm group-data-[collapsible=icon]:font-bold transition-all">
              <span className="hidden group-data-[collapsible=icon]:block">M</span>
            </div>
          </div>
          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 transition-colors group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-2 group-data-[collapsible=icon]:right-2 group-data-[collapsible=icon]:p-1"
          >
            {state === "expanded" ? (
              <ChevronsLeft className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronsRight className="w-3 h-3 text-gray-500" />
            )}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
        {/* Main Menu */}
        <SidebarGroup className="mb-8 group-data-[collapsible=icon]:mb-6">
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 group-data-[collapsible=icon]:sr-only">
            MAIN MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 group-data-[collapsible=icon]:space-y-1">
              <SidebarMenuItem>
                <Link href="/" onClick={handleLinkClick}>
                  <SidebarMenuButton
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0 ${
                      pathname === '/' ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    isActive={pathname === '/'}
                    tooltip="Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    <span className="group-data-[collapsible=icon]:sr-only">Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/events" onClick={handleLinkClick}>
                  <SidebarMenuButton
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0 ${
                      pathname === '/events' ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    isActive={pathname === '/events'}
                    tooltip="Events"
                  >
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="group-data-[collapsible=icon]:sr-only">Events</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/invitations" onClick={handleLinkClick}>
                  <SidebarMenuButton
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0 ${
                      pathname === '/invitations' ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    isActive={pathname === '/invitations'}
                    tooltip="Invitations"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <span className="group-data-[collapsible=icon]:sr-only">Invitations</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0"
                  tooltip="Catering status"
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:sr-only">Catering status</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0"
                  tooltip="Guest traffic"
                >
                  <TrendingUp className="w-5 h-5 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:sr-only">Guest traffic</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg active:bg-gray-200 transition-colors relative group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0"
                  tooltip="Gifts"
                >
                  <Gift className="w-5 h-5 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:sr-only">Gifts</span>
                  <SidebarMenuBadge className="ml-auto bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded-full group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:-top-1 group-data-[collapsible=icon]:-right-1 group-data-[collapsible=icon]:w-4 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:text-[10px] group-data-[collapsible=icon]:ml-0">
                    28
                  </SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 group-data-[collapsible=icon]:sr-only">
            SETTINGS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 group-data-[collapsible=icon]:space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0"
                  tooltip="Account"
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:sr-only">Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0"
                  tooltip="Wallet"
                >
                  <Wallet className="w-5 h-5 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:sr-only">Wallet</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0"
                  tooltip="Help & support"
                >
                  <HelpCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:sr-only">Help & support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Log out */}
      <SidebarFooter className="p-4 border-t border-gray-200 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton>
              <SidebarMenuButton
                className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg active:bg-gray-200 transition-colors group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0"
                tooltip="Log out"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="group-data-[collapsible=icon]:sr-only">Log out</span>
              </SidebarMenuButton>
            </SignOutButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default VorgezSidebar; 