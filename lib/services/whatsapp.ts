import QRCode from 'qrcode';

export interface WhatsAppInvitation {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  invitationId: string;
}

export async function sendWhatsAppInvitation(invitation: WhatsAppInvitation) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const rsvpLink = `${baseUrl}/rsvp/${invitation.invitationId}`;

    const message = `
Hi ${invitation.guestName}!

You're invited to ${invitation.eventName} on ${invitation.eventDate}!

RSVP here: ${rsvpLink}
`;

    // Implementation here - integrate with your WhatsApp provider
    console.log('Sending WhatsApp:', message);

    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp invitation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface WhatsAppReminder {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  invitationId: string;
}

export async function sendWhatsAppReminder(reminder: WhatsAppReminder) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const rsvpLink = `${baseUrl}/rsvp/${reminder.invitationId}`;

    const message = `
Hi ${reminder.guestName}!

This is a reminder for ${reminder.eventName} on ${reminder.eventDate}.
Please let us know if you can make it!

RSVP here: ${rsvpLink}
`;

    // Implementation here - integrate with your WhatsApp provider
    console.log('Sending reminder WhatsApp:', message);

    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp reminder:', error);
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