import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendInvitationEmail } from '@/lib/services/email';
import { sendInvitationSMS } from '@/lib/services/sms';
import { sendWhatsAppInvitation } from '@/lib/services/whatsapp';
import { format } from 'date-fns';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the invitation
    const invitation = await prisma.guest.findFirst({
      where: {
        id: params.id,
        createdBy: dbUser.id,
      },
      include: {
        event: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Send invitations based on selected methods
    const sendingPromises = [];

    if (invitation.invitationMethod.includes('email') && invitation.email) {
      sendingPromises.push(
        sendInvitationEmail({
          to: invitation.email,
          guestName: invitation.name,
          eventName: invitation.event?.name || 'the event',
          eventDate: invitation.event?.date ? format(invitation.event.date, 'PPP') : 'TBD',
          eventTime: invitation.event?.time || undefined,
          eventLocation: invitation.event?.location || undefined,
          hostName: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email,
          invitationId: invitation.id,
        })
      );
    }

    if (invitation.invitationMethod.includes('sms') && invitation.phone) {
      sendingPromises.push(
        sendInvitationSMS({
          to: invitation.phone,
          guestName: invitation.name,
          eventName: invitation.event?.name || 'the event',
          eventDate: invitation.event?.date ? format(invitation.event.date, 'PPP') : 'TBD',
          invitationId: invitation.id,
        })
      );
    }

    if (invitation.invitationMethod.includes('whatsapp') && invitation.phone) {
      sendingPromises.push(
        sendWhatsAppInvitation({
          to: invitation.phone,
          guestName: invitation.name,
          eventName: invitation.event?.name || 'the event',
          eventDate: invitation.event?.date ? format(invitation.event.date, 'PPP') : 'TBD',
          invitationId: invitation.id,
        })
      );
    }

    // Wait for all sending methods to complete
    await Promise.all(sendingPromises);

    // Update invitation status and create sent message records
    await prisma.guest.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        sentMessages: {
          create: invitation.invitationMethod.map(method => ({
            type: 'invitation',
            method,
            content: `Invitation sent via ${method}`,
            status: 'sent',
            sentAt: new Date(),
            user: {
              connect: {
                id: dbUser.id,
              },
            },
          })),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 