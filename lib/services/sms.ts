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
  eventTime: string;
  eventLocation?: string;
  hostName: string;
  customMessage?: string;
  rsvpLink?: string;
}

export const sendInvitationSMS = async (invitation: SMSInvitation) => {
  try {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured');
    }

    const message = `🎉 You're Invited! 

Hi ${invitation.guestName}!

${invitation.hostName} invites you to:
📅 ${invitation.eventName}
🗓️ ${invitation.eventDate}
🕒 ${invitation.eventTime}${invitation.eventLocation ? `\n📍 ${invitation.eventLocation}` : ''}

${invitation.customMessage ? `\n💬 "${invitation.customMessage}"\n` : ''}

${invitation.rsvpLink ? `Please RSVP: ${invitation.rsvpLink}\n` : ''}

Hope to see you there! 🎊

- Sent via Mulumela`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: invitation.to,
    });

    return {
      success: true,
      messageId: result.sid,
      error: null
    };
  } catch (error) {
    console.error('Failed to send invitation SMS:', error);
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const sendReminderSMS = async (invitation: SMSInvitation) => {
  try {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured');
    }

    const message = `⏰ Reminder: ${invitation.eventName} is Tomorrow!

Hi ${invitation.guestName},

Don't forget about ${invitation.eventName}!
🗓️ Tomorrow, ${invitation.eventDate}
🕒 ${invitation.eventTime}${invitation.eventLocation ? `\n📍 ${invitation.eventLocation}` : ''}

See you there! 🎉

- ${invitation.hostName}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: invitation.to,
    });

    return {
      success: true,
      messageId: result.sid,
      error: null
    };
  } catch (error) {
    console.error('Failed to send reminder SMS:', error);
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const sendThankYouSMS = async (invitation: SMSInvitation, attended: boolean) => {
  try {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured');
    }

    const message = attended
      ? `🙏 Thank you for attending ${invitation.eventName}!

Hi ${invitation.guestName},

Thank you so much for being part of ${invitation.eventName}! It was wonderful having you there.

We hope you enjoyed the event and look forward to seeing you at future events! 🎊

Best regards,
${invitation.hostName}`
      : `💙 We missed you at ${invitation.eventName}

Hi ${invitation.guestName},

We missed you at ${invitation.eventName}! We hope everything is well with you.

We'll keep you in mind for future events and hope to see you next time! 🌟

Best regards,
${invitation.hostName}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: invitation.to,
    });

    return {
      success: true,
      messageId: result.sid,
      error: null
    };
  } catch (error) {
    console.error('Failed to send thank you SMS:', error);
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Utility function to format phone number for SMS
export const formatPhoneForSMS = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Add + if not present and number starts with country code
  if (!phone.startsWith('+')) {
    if (digitsOnly.length === 10) {
      // Assume US number, add +1
      return `+1${digitsOnly}`;
    } else if (digitsOnly.length > 10) {
      // Assume international, add +
      return `+${digitsOnly}`;
    }
  }
  
  return phone;
};

// Function to validate phone number format
export const isValidPhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneForSMS(phone);
  // Basic validation for international phone numbers
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(formatted);
}; 