'use client';
import React, { useState, useEffect } from 'react';
import { User, Users } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserSync } from '@/hooks/use-user-sync';
import { toast } from 'sonner';
import VorgezSidebar from './Sidebar';
import Header from './Header';
import StatsCard from './StatsCard';
import RecentGuests from './RecentGuests';
import GuestTraffic from './GuestTraffic';
import VisitorTraffic from './VisitorTraffic';
import GuestList from './GuestList';
import TemporaryTraffic from './TemporaryTraffic';

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  rsvpResponse?: string | null;
  respondedAt?: Date | null;
  invitationMethod: string[];
  event?: {
    id: string;
    name: string;
    date: Date;
    time?: string;
    location?: string;
  } | null;
}

const Dashboard = () => {
  // Ensure user is synced with database
  useUserSync();
  
  // Add state for guests
  const [guests, setGuests] = useState<Guest[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch guests when component mounts
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/guests');
        if (!response.ok) {
          throw new Error('Failed to fetch guests');
        }
        const data = await response.json();
        setGuests(data);
      } catch (err) {
        console.error('Error fetching guests:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch guests';
        setError(errorMessage);
        toast.error("Failed to load guests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuests();
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gray-50 no-zoom w-full">
        {/* Sidebar */}
        <VorgezSidebar />
        
        {/* Main Content */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Header */}
          <Header />
          
          {/* Dashboard Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 momentum-scroll overflow-x-hidden">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-fit grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="guests">Guest list</TabsTrigger>
                <TabsTrigger value="traffic">Temporary traffic</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <StatsCard
                    title="Male Guest"
                    icon={<User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
                    totalInvites="8,124"
                    totalCome="4,204"
                    bgColor="bg-gradient-to-br from-teal-300 to-cyan-400"
                    textColor="text-gray-800"
                  />
                  <StatsCard
                    title="Female Guest"
                    icon={<Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
                    totalInvites="9,620"
                    totalCome="6,125"
                    bgColor="bg-gradient-to-br from-purple-300 to-pink-400"
                    textColor="text-gray-800"
                  />
                </div>
                
                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                  {/* Recent Guests */}
                  <div className="lg:col-span-4">
                    <RecentGuests />
                  </div>
                  
                  {/* Guest Traffic */}
                  <div className="lg:col-span-5">
                    <GuestTraffic />
                  </div>
                  
                  {/* Visitor Traffic */}
                  <div className="lg:col-span-3">
                    <VisitorTraffic />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="guests">
                <GuestList guests={guests} />
              </TabsContent>
              
              <TabsContent value="traffic">
                <TemporaryTraffic />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard; 