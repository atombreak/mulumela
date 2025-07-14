import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RSVPForm } from './RSVPForm';

// Metadata for the page
export const metadata: Metadata = {
  title: 'RSVP Response',
  description: 'Respond to your invitation',
};

// Props type for the page
interface PageProps {
  params: {
    id: string;
  };
}

// Function to fetch invitation details
async function getInvitation(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rsvp/${id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch invitation');
    }
    
    const data = await res.json();
    return data.invitation;
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return null;
  }
}

// The RSVP page component
export default async function RSVPPage({ params }: PageProps) {
  const invitation = await getInvitation(params.id);
  
  if (!invitation) {
    notFound();
  }

  const eventDate = invitation.event ? format(new Date(invitation.event.date), 'PPPP') : null;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>You're Invited!</CardTitle>
            <CardDescription>
              Please respond to your invitation from {invitation.host?.name}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {invitation.event && (
              <div className="mb-6 space-y-2">
                <h3 className="font-semibold">{invitation.event.name}</h3>
                <p className="text-sm text-gray-600">
                  {eventDate}
                  {invitation.event.time && ` at ${invitation.event.time}`}
                </p>
                {invitation.event.location && (
                  <p className="text-sm text-gray-600">{invitation.event.location}</p>
                )}
              </div>
            )}

            {invitation.status === 'responded' ? (
              <Alert>
                <AlertDescription>
                  You have already responded {invitation.rsvpResponse} to this invitation
                  {invitation.respondedAt && ` on ${format(new Date(invitation.respondedAt), 'PPP')}`}.
                </AlertDescription>
              </Alert>
            ) : (
              <RSVPForm invitationId={invitation.id} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 