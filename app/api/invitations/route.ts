import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendInvitationEmail } from '@/lib/services/email';
import { sendInvitationSMS } from '@/lib/services/sms';
import { sendWhatsAppInvitation } from '@/lib/services/whatsapp';
import { format } from 'date-fns';

// GET /api/invitations - Get all invitations for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
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

    // Get all guests created by this user (these are their invitations)
    const invitations = await prisma.guest.findMany({
      where: { createdBy: user.id },
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
          take: 3, // Last 3 messages
        },
        _count: {
          select: {
            sentMessages: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/invitations - Create one or more invitations and optionally send them
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
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
    
    // Check if this is a batch invitation request
    const isBatchInvitation = Array.isArray(body);
    const invitationsToCreate = isBatchInvitation ? body : [body];

    // Validate all invitations
    for (const invitation of invitationsToCreate) {
      const { 
        name, 
        email, 
        phone, 
        eventId,
        invitationMethods = [],
        sendImmediately = false
      } = invitation;

      // Validate required fields
      if (!name) {
        return NextResponse.json(
          { error: 'Guest name is required for all invitations' },
          { status: 400 }
        );
      }

      // Validate that at least one contact method is provided if sending immediately
      if (sendImmediately && invitationMethods.length > 0) {
        if (invitationMethods.includes('email') && !email) {
          return NextResponse.json(
            { error: `Email is required for guest "${name}" when sending via email` },
            { status: 400 }
          );
        }
        if ((invitationMethods.includes('sms') || invitationMethods.includes('whatsapp')) && !phone) {
          return NextResponse.json(
            { error: `Phone number is required for guest "${name}" when sending via SMS or WhatsApp` },
            { status: 400 }
          );
        }
      }

      // Validate event if provided
      if (eventId) {
        const event = await prisma.event.findFirst({
          where: { 
            id: eventId,
            createdBy: user.id 
          }
        });
        
        if (!event) {
          return NextResponse.json(
            { error: 'Event not found' },
            { status: 404 }
          );
        }
      }
    }

    // Create all invitations and send if requested
    const results = await Promise.all(
      invitationsToCreate.map(async (invitation) => {
        const { 
          name, 
          email, 
          phone, 
          gender, 
          eventId,
          customMessage,
          invitationMethods = [],
          sendImmediately = false
        } = invitation;

        // Create new guest (invitation)
        const newInvitation = await prisma.guest.create({
          data: {
            name,
            email: email || '',
            phone: phone || '',
            gender,
            eventId: eventId || null,
            customMessage,
            invitationMethod: invitationMethods,
            invited: sendImmediately,
            status: sendImmediately ? 'sent' : 'pending',
            createdBy: user.id,
          },
          include: {
            event: true,
          }
        });

        // Send invitations if requested
        const sendingResults = [];
        if (sendImmediately && invitationMethods.length > 0 && newInvitation.event) {
          const event = newInvitation.event;
          const hostName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
          const eventDate = format(event.date, 'PPPP');
          const eventTime = event.time || '12:00 PM';
          
          const invitationData = {
            to: '',
            guestName: name,
            eventName: event.name,
            eventDate,
            eventTime,
            eventLocation: event.location ?? undefined,
            hostName,
            customMessage,
            rsvpLink: `${process.env.NEXT_PUBLIC_BASE_URL}/rsvp/${newInvitation.id}`,
          };

          // Send via email
          if (invitationMethods.includes('email') && email) {
            const emailResult = await sendInvitationEmail({
              ...invitationData,
              to: email,
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
                recipientEmail: email,
                guestId: newInvitation.id,
                eventId: event.id,
                sentBy: user.id,
              }
            });
            
            sendingResults.push({ method: 'email', success: emailResult.success, error: emailResult.error });
          }

          // Send via SMS
          if (invitationMethods.includes('sms') && phone) {
            const smsResult = await sendInvitationSMS({
              ...invitationData,
              to: phone,
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
                recipientPhone: phone,
                guestId: newInvitation.id,
                eventId: event.id,
                sentBy: user.id,
              }
            });
            
            sendingResults.push({ method: 'sms', success: smsResult.success, error: smsResult.error });
          }

          // Prepare WhatsApp link
          if (invitationMethods.includes('whatsapp') && phone) {
            const whatsappResult = await sendWhatsAppInvitation({
              ...invitationData,
              to: phone,
            });
            
            // Log the WhatsApp preparation
            await prisma.sentMessage.create({
              data: {
                type: 'invitation',
                method: 'whatsapp',
                status: whatsappResult.success ? 'sent' : 'failed',
                subject: `WhatsApp Invitation to ${event.name}`,
                content: whatsappResult.url,
                messageId: null,
                errorMessage: whatsappResult.error,
                recipientPhone: phone,
                guestId: newInvitation.id,
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
        }

        return { 
          invitation: newInvitation, 
          sendingResults: sendingResults.length > 0 ? sendingResults : undefined
        };
      })
    );

    // Return appropriate response based on whether this was a batch request
    if (isBatchInvitation) {
      return NextResponse.json({ 
        invitations: results.map(r => r.invitation),
        sendingResults: results.map(r => r.sendingResults).filter(Boolean)
      }, { status: 201 });
    } else {
      return NextResponse.json(results[0], { status: 201 });
    }
  } catch (error) {
    console.error('Error creating invitation(s):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 