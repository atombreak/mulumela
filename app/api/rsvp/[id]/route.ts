import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRSVPNotification } from '@/lib/services/email';
import { format } from 'date-fns';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/rsvp/[id] - Get invitation details for RSVP page
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const invitation = await prisma.guest.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Don't expose sensitive information
    const safeInvitation = {
      id: invitation.id,
      name: invitation.name,
      status: invitation.status,
      rsvpResponse: invitation.rsvpResponse,
      respondedAt: invitation.respondedAt,
      event: invitation.event ? {
        name: invitation.event.name,
        date: invitation.event.date,
        time: invitation.event.time,
        location: invitation.event.location,
      } : null,
      host: invitation.user ? {
        name: `${invitation.user.firstName || ''} ${invitation.user.lastName || ''}`.trim() || invitation.user.email,
      } : null,
    };

    return NextResponse.json({ invitation: safeInvitation });
  } catch (error) {
    console.error('Error fetching RSVP details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/rsvp/[id] - Submit RSVP response
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { response, message } = body;

    // Validate response
    if (!response || !['yes', 'no', 'maybe'].includes(response)) {
      return NextResponse.json(
        { error: 'Invalid response. Must be "yes", "no", or "maybe"' },
        { status: 400 }
      );
    }

    // Get the invitation with event and host details
    const invitation = await prisma.guest.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (!invitation.event) {
      return NextResponse.json({ error: 'No event found for this invitation' }, { status: 400 });
    }

    // Update the invitation with the response
    const updatedInvitation = await prisma.guest.update({
      where: { id: params.id },
      data: {
        status: 'responded',
        rsvpResponse: response,
        respondedAt: new Date(),
      },
    });

    // Send notification to the host
    if (invitation.user && invitation.user.email) {
      const eventDate = format(invitation.event.date, 'PPPP');
      const eventTime = invitation.event.time || '12:00 PM';
      
      const emailResult = await sendRSVPNotification({
        to: invitation.user.email,
        hostName: `${invitation.user.firstName || ''} ${invitation.user.lastName || ''}`.trim() || invitation.user.email,
        guestName: invitation.name,
        eventName: invitation.event.name,
        eventDate,
        eventTime,
        response,
        message: message || undefined,
      });

      // Log the notification
      await prisma.sentMessage.create({
        data: {
          type: 'rsvp_notification',
          method: 'email',
          status: emailResult.success ? 'sent' : 'failed',
          subject: `RSVP Response: ${invitation.name} has responded to your invitation`,
          content: `${invitation.name} has responded "${response}" to your invitation for ${invitation.event.name}`,
          messageId: emailResult.messageId,
          errorMessage: emailResult.error,
          recipientEmail: invitation.user.email,
          guestId: invitation.id,
          eventId: invitation.event.id,
          sentBy: invitation.user.id,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      invitation: {
        id: updatedInvitation.id,
        status: updatedInvitation.status,
        rsvpResponse: updatedInvitation.rsvpResponse,
        respondedAt: updatedInvitation.respondedAt,
      },
    });
  } catch (error) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 