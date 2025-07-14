import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { RSVPStats } from '@/components/dashboard/RSVPStats';
import GuestList from '@/components/dashboard/GuestList';

interface PageProps {
  params: {
    id: string;
  };
}

async function getEvent(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch event');
    }
    
    const data = await res.json();
    return data.event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventPage({ params }: PageProps) {
  const event = await getEvent(params.id);
  
  if (!event) {
    notFound();
  }

  const eventDate = format(new Date(event.date), 'PPPP');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
        <p className="text-gray-600">
          {eventDate}
          {event.time && ` at ${event.time}`}
          {event.location && ` • ${event.location}`}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">RSVP Statistics</h2>
        <RSVPStats guests={event.guests} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Guest List</h2>
        <GuestList guests={event.guests} />
      </div>
    </div>
  );
} 