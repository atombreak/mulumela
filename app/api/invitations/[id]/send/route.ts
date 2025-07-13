import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendInvitationEmail } from '@/lib/services/email';
import { sendInvitationSMS } from '@/lib/services/sms';
import { sendWhatsAppInvitation } from '@/lib/services/whatsapp';
import { format } from 'date-fns';

interface Params {
  id: string;
}

// POST /api/invitations/[id]/send - Send invitation via specific methods
export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { methods = [], customMessage } = body;

    if (!methods || methods.length === 0) {
      return NextResponse.json(
        { error: 'At least one communication method is required' },
        { status: 400 }
      );
    }

    // Get the invitation/guest
    const invitation = await prisma.guest.findFirst({
      where: { 
        id,
        createdBy: user.id 
      },
      include: {
        event: true,
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Validate contact methods
    if (methods.includes('email') && !invitation.email) {
      return NextResponse.json(
        { error: 'Guest email is required for email invitations' },
        { status: 400 }
      );
    }

    if ((methods.includes('sms') || methods.includes('whatsapp')) && !invitation.phone) {
      return NextResponse.json(
        { error: 'Guest phone number is required for SMS/WhatsApp invitations' },
        { status: 400 }
      );
    }

    if (!invitation.event) {
      return NextResponse.json(
        { error: 'No event associated with this invitation' },
        { status: 400 }
      );
    }

    const event = invitation.event;
    const hostName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const eventDate = format(event.date, 'PPPP');
    const eventTime = event.time || '12:00 PM';
    
    const invitationData = {
      to: '',
      guestName: invitation.name,
      eventName: event.name,
      eventDate,
      eventTime,
      eventLocation: event.location ?? undefined,
      hostName,
      customMessage: customMessage || invitation.customMessage,
      rsvpLink: `${process.env.NEXT_PUBLIC_BASE_URL}/rsvp/${invitation.id}`,
    };

    const sendingResults = [];

    // Send via email
    if (methods.includes('email') && invitation.email) {
      const emailResult = await sendInvitationEmail({
        ...invitationData,
        to: invitation.email,
      });
      
      // Log the sent message
      await prisma.sentMessage.create({
        data: {
          type: 'invitation',
          method: 'email',
          status: emailResult.success ? 'sent' : 'failed',
          subject: `You're Invited to ${event.name}!`,
          content: `Invitation to ${event.name} on ${eventDate} at ${eventTime}`,
          messageId: emailResult.messageId,
          errorMessage: emailResult.error,
          recipientEmail: invitation.email,
          guestId: invitation.id,
          eventId: event.id,
          sentBy: user.id,
        }
      });
      
      sendingResults.push({ method: 'email', success: emailResult.success, error: emailResult.error });
    }

    // Send via SMS
    if (methods.includes('sms') && invitation.phone) {
      const smsResult = await sendInvitationSMS({
        ...invitationData,
        to: invitation.phone,
      });
      
      // Log the sent message
      await prisma.sentMessage.create({
        data: {
          type: 'invitation',
          method: 'sms',
          status: smsResult.success ? 'sent' : 'failed',
          subject: `Invitation to ${event.name}`,
          content: `You're invited to ${event.name} on ${eventDate} at ${eventTime}`,
          messageId: smsResult.messageId,
          errorMessage: smsResult.error,
          recipientPhone: invitation.phone,
          guestId: invitation.id,
          eventId: event.id,
          sentBy: user.id,
        }
      });
      
      sendingResults.push({ method: 'sms', success: smsResult.success, error: smsResult.error });
    }

    // Prepare WhatsApp link
    if (methods.includes('whatsapp') && invitation.phone) {
      const whatsappResult = await sendWhatsAppInvitation({
        ...invitationData,
        to: invitation.phone,
      });
      
      // Log the WhatsApp preparation
      await prisma.sentMessage.create({
        data: {
          type: 'invitation',
          method: 'whatsapp',
          status: whatsappResult.success ? 'sent' : 'failed',
          subject: `WhatsApp Invitation to ${event.name}`,
          content: whatsappResult.url,
          messageId: null, // WhatsApp doesn't return message IDs for links
          errorMessage: whatsappResult.error,
          recipientPhone: invitation.phone,
          guestId: invitation.id,
          eventId: event.id,
          sentBy: user.id,
        }
      });
      
      sendingResults.push({ 
        method: 'whatsapp', 
        success: whatsappResult.success, 
        error: whatsappResult.error,
        url: whatsappResult.url,
        qrCode: whatsappResult.qrCode
      });
    }

    // Update invitation status
    const updatedMethods = [...new Set([...invitation.invitationMethod, ...methods])];
    await prisma.guest.update({
      where: { id: invitation.id },
      data: {
        status: 'sent',
        invited: true,
        invitationMethod: updatedMethods,
        customMessage: customMessage || invitation.customMessage,
      }
    });

    return NextResponse.json({ 
      success: true,
      sendingResults,
      invitation: {
        ...invitation,
        status: 'sent',
        invited: true,
        invitationMethod: updatedMethods,
      }
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 