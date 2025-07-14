import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import GuestDashboard from '@/components/dashboard/GuestDashboard';

export const metadata: Metadata = {
  title: 'Guests | Mulumela',
  description: 'Manage your event guests and invitations',
};

async function getGuestsData() {
  const { userId } = await auth();
  if (!userId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) return null;

  const guests = await prisma.guest.findMany({
    where: { createdBy: dbUser.id },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          date: true,
          time: true,
          location: true,
        }
      },
      sentMessages: {
        orderBy: { sentAt: 'desc' },
        take: 3,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return guests;
}

export default async function GuestsPage() {
  const guests = await getGuestsData();
  
  if (!guests) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>Please sign in to view your guests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <GuestDashboard initialGuests={guests} />
    </div>
  );
} 