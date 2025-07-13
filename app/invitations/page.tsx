import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import VorgezSidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import InvitationPage from '../../components/dashboard/InvitationPage';

export default function InvitationsPage() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gray-50 no-zoom w-full">
        {/* Sidebar */}
        <VorgezSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 bg-gray-50 momentum-scroll overflow-x-hidden">
            <InvitationPage />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export const metadata = {
  title: 'Invitations - Mulumela',
  description: 'Manage and track your event invitations',
}; 