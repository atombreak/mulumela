import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface SMSInvitation {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  invitationId: string;
}

export async function sendInvitationSMS(invitation: SMSInvitation) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const rsvpLink = `${baseUrl}/rsvp/${invitation.invitationId}`;

    const message = `
Hi ${invitation.guestName}!

You're invited to ${invitation.eventName} on ${invitation.eventDate}!

RSVP here: ${rsvpLink}
`;

    // Implementation here - integrate with your SMS provider
    console.log('Sending SMS:', message);

    return { success: true };
  } catch (error) {
    console.error('Error sending invitation SMS:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface SMSReminder {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  invitationId: string;
}

export async function sendReminderSMS(reminder: SMSReminder) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const rsvpLink = `${baseUrl}/rsvp/${reminder.invitationId}`;

    const message = `
Hi ${reminder.guestName}!

This is a reminder for ${reminder.eventName} on ${reminder.eventDate}.
Please let us know if you can make it!

RSVP here: ${rsvpLink}
`;

    // Implementation here - integrate with your SMS provider
    console.log('Sending reminder SMS:', message);

    return { success: true };
  } catch (error) {
    console.error('Error sending reminder SMS:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function to format phone numbers
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Ensure the number starts with a country code
  return digitsOnly.startsWith('1') ? digitsOnly : `1${digitsOnly}`;
} 