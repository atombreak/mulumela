import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailInvitation {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  hostName: string;
  invitationId: string;
}

export async function sendInvitationEmail(invitation: EmailInvitation) {
  try {
    const {
      to,
      guestName,
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      hostName,
      invitationId,
    } = invitation;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const rsvpLink = `${baseUrl}/rsvp/${invitationId}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">You're Invited! 🎉</h1>
        
        <p>Dear ${guestName},</p>
        
        <p>You are cordially invited to ${eventName}!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${eventDate}</p>
          ${eventTime ? `<p style="margin: 10px 0;"><strong>Time:</strong> ${eventTime}</p>` : ''}
          ${eventLocation ? `<p style="margin: 0;"><strong>Location:</strong> ${eventLocation}</p>` : ''}
        </div>
        
        <p>Please let us know if you can make it by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${rsvpLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            RSVP Now
          </a>
        </div>
        
        <p>We look forward to celebrating with you!</p>
        
        <p>Best regards,<br>${hostName}</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'Mulumela <invitations@mulumela.com>',
      to: [to],
      subject: `You're Invited to ${eventName}!`,
      html: emailHtml,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface EmailReminder {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  hostName: string;
  invitationId: string;
}

export async function sendReminderEmail(reminder: EmailReminder) {
  try {
    const {
      to,
      guestName,
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      hostName,
      invitationId,
    } = reminder;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const rsvpLink = `${baseUrl}/rsvp/${invitationId}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Event Reminder</h1>
        
        <p>Dear ${guestName},</p>
        
        <p>This is a reminder about ${eventName}!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${eventDate}</p>
          ${eventTime ? `<p style="margin: 10px 0;"><strong>Time:</strong> ${eventTime}</p>` : ''}
          ${eventLocation ? `<p style="margin: 0;"><strong>Location:</strong> ${eventLocation}</p>` : ''}
        </div>
        
        <p>Please let us know if you can make it by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${rsvpLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            RSVP Now
          </a>
        </div>
        
        <p>We hope to see you there!</p>
        
        <p>Best regards,<br>${hostName}</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'Mulumela <invitations@mulumela.com>',
      to: [to],
      subject: `Reminder: ${eventName}`,
      html: emailHtml,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 