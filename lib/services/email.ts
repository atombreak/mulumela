import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailInvitation {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation?: string;
  hostName: string;
  customMessage?: string;
  rsvpLink?: string;
}

// Email templates
const getInvitationEmailTemplate = (invitation: EmailInvitation) => {
  return {
    subject: `You're Invited to ${invitation.eventName}!`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Invitation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .event-details { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-item { margin: 10px 0; }
          .label { font-weight: bold; color: #374151; }
          .value { color: #6b7280; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">✨ You're Invited! ✨</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #374151;">Dear ${invitation.guestName},</p>
            <p style="color: #6b7280; line-height: 1.6;">
              ${invitation.hostName} is excited to invite you to a special event!
            </p>
            
            ${invitation.customMessage ? `
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-style: italic;">"${invitation.customMessage}"</p>
              </div>
            ` : ''}

            <div class="event-details">
              <h3 style="margin-top: 0; color: #2563eb;">📅 Event Details</h3>
              <div class="detail-item">
                <span class="label">Event:</span> <span class="value">${invitation.eventName}</span>
              </div>
              <div class="detail-item">
                <span class="label">Date:</span> <span class="value">${invitation.eventDate}</span>
              </div>
              <div class="detail-item">
                <span class="label">Time:</span> <span class="value">${invitation.eventTime}</span>
              </div>
              ${invitation.eventLocation ? `
                <div class="detail-item">
                  <span class="label">Location:</span> <span class="value">${invitation.eventLocation}</span>
                </div>
              ` : ''}
            </div>

            ${invitation.rsvpLink ? `
              <div style="text-align: center;">
                <a href="${invitation.rsvpLink}" class="cta-button">RSVP Now</a>
              </div>
            ` : ''}

            <p style="color: #6b7280; line-height: 1.6;">
              We can't wait to see you there! Please let us know if you can make it.
            </p>
          </div>
          <div class="footer">
            <p>This invitation was sent via Mulumela Event Management</p>
            <p>Powered by ${invitation.hostName}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${invitation.guestName},

      You're invited to ${invitation.eventName}!

      Event Details:
      - Event: ${invitation.eventName}
      - Date: ${invitation.eventDate}
      - Time: ${invitation.eventTime}
      ${invitation.eventLocation ? `- Location: ${invitation.eventLocation}` : ''}

      ${invitation.customMessage ? `Message from ${invitation.hostName}: "${invitation.customMessage}"` : ''}

      ${invitation.rsvpLink ? `Please RSVP at: ${invitation.rsvpLink}` : ''}

      We look forward to seeing you there!

      Best regards,
      ${invitation.hostName}
    `
  };
};

export const sendInvitationEmail = async (invitation: EmailInvitation) => {
  try {
    const template = getInvitationEmailTemplate(invitation);
    
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Mulumela <onboarding@resend.dev>',
      to: invitation.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return {
      success: true,
      messageId: result.data?.id,
      error: null
    };
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const sendReminderEmail = async (invitation: EmailInvitation) => {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Mulumela <onboarding@resend.dev>',
      to: invitation.to,
      subject: `Reminder: ${invitation.eventName} is Tomorrow!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">⏰ Event Reminder</h1>
          </div>
          <div style="padding: 20px; background-color: white; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p>Hi ${invitation.guestName},</p>
            <p>This is a friendly reminder that <strong>${invitation.eventName}</strong> is tomorrow!</p>
            <div style="background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <p style="margin: 0;"><strong>📅 Date:</strong> ${invitation.eventDate}</p>
              <p style="margin: 5px 0 0 0;"><strong>🕒 Time:</strong> ${invitation.eventTime}</p>
              ${invitation.eventLocation ? `<p style="margin: 5px 0 0 0;"><strong>📍 Location:</strong> ${invitation.eventLocation}</p>` : ''}
            </div>
            <p>We're looking forward to seeing you there!</p>
            <p>Best regards,<br/>${invitation.hostName}</p>
          </div>
        </div>
      `,
    });

    return {
      success: true,
      messageId: result.data?.id,
      error: null
    };
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const sendThankYouEmail = async (invitation: EmailInvitation, attended: boolean) => {
  try {
    const subject = attended 
      ? `Thank you for attending ${invitation.eventName}!`
      : `We missed you at ${invitation.eventName}`;
    
    const content = attended
      ? `
        <p>Dear ${invitation.guestName},</p>
        <p>Thank you so much for attending <strong>${invitation.eventName}</strong>! It was wonderful having you there.</p>
        <p>We hope you enjoyed the event and look forward to seeing you at future events.</p>
      `
      : `
        <p>Dear ${invitation.guestName},</p>
        <p>We missed you at <strong>${invitation.eventName}</strong>! We hope everything is well with you.</p>
        <p>We'll keep you in mind for future events and hope to see you next time.</p>
      `;

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Mulumela <onboarding@resend.dev>',
      to: invitation.to,
      subject,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${attended ? '#10b981' : '#6b7280'} 0%, ${attended ? '#059669' : '#4b5563'} 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">${attended ? '🙏' : '💙'} ${attended ? 'Thank You!' : 'Until Next Time'}</h1>
          </div>
          <div style="padding: 20px; background-color: white; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            ${content}
            <p>Warm regards,<br/>${invitation.hostName}</p>
          </div>
        </div>
      `,
    });

    return {
      success: true,
      messageId: result.data?.id,
      error: null
    };
  } catch (error) {
    console.error('Failed to send thank you email:', error);
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 