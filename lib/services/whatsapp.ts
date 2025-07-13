import QRCode from 'qrcode';

export interface WhatsAppInvitation {
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

// Generate WhatsApp message text
const generateWhatsAppMessage = (invitation: WhatsAppInvitation): string => {
  return `🎉 *You're Invited!*

Hi ${invitation.guestName}!

${invitation.hostName} invites you to:
📅 *${invitation.eventName}*
🗓️ ${invitation.eventDate}
🕒 ${invitation.eventTime}${invitation.eventLocation ? `\n📍 ${invitation.eventLocation}` : ''}

${invitation.customMessage ? `\n💬 _"${invitation.customMessage}"_\n` : ''}

${invitation.rsvpLink ? `Please RSVP: ${invitation.rsvpLink}\n` : ''}

Hope to see you there! 🎊

_Sent via Mulumela Event Management_`;
};

// Generate WhatsApp URL for web.whatsapp.com
export const generateWhatsAppURL = (invitation: WhatsAppInvitation): string => {
  const message = generateWhatsAppMessage(invitation);
  const encodedMessage = encodeURIComponent(message);
  
  // Format phone number for WhatsApp (remove + and any non-digits)
  const formattedPhone = invitation.to.replace(/\D/g, '');
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Generate WhatsApp QR Code
export const generateWhatsAppQR = async (invitation: WhatsAppInvitation): Promise<{
  success: boolean;
  qrCode?: string;
  url?: string;
  error?: string;
}> => {
  try {
    const url = generateWhatsAppURL(invitation);
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2563eb',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });

    return {
      success: true,
      qrCode: qrCodeDataURL,
      url,
      error: undefined
    };
  } catch (error) {
    console.error('Failed to generate WhatsApp QR code:', error);
    return {
      success: false,
      qrCode: undefined,
      url: undefined,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Generate reminder message for WhatsApp
export const generateWhatsAppReminderURL = (invitation: WhatsAppInvitation): string => {
  const message = `⏰ *Reminder: ${invitation.eventName} is Tomorrow!*

Hi ${invitation.guestName},

Don't forget about *${invitation.eventName}*!
🗓️ Tomorrow, ${invitation.eventDate}
🕒 ${invitation.eventTime}${invitation.eventLocation ? `\n📍 ${invitation.eventLocation}` : ''}

See you there! 🎉

_${invitation.hostName}_`;

  const encodedMessage = encodeURIComponent(message);
  const formattedPhone = invitation.to.replace(/\D/g, '');
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Generate thank you message for WhatsApp
export const generateWhatsAppThankYouURL = (invitation: WhatsAppInvitation, attended: boolean): string => {
  const message = attended
    ? `🙏 *Thank you for attending ${invitation.eventName}!*

Hi ${invitation.guestName},

Thank you so much for being part of *${invitation.eventName}*! It was wonderful having you there.

We hope you enjoyed the event and look forward to seeing you at future events! 🎊

Best regards,
_${invitation.hostName}_`
    : `💙 *We missed you at ${invitation.eventName}*

Hi ${invitation.guestName},

We missed you at *${invitation.eventName}*! We hope everything is well with you.

We'll keep you in mind for future events and hope to see you next time! 🌟

Best regards,
_${invitation.hostName}_`;

  const encodedMessage = encodeURIComponent(message);
  const formattedPhone = invitation.to.replace(/\D/g, '');
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Function to validate WhatsApp phone number format
export const isValidWhatsAppNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // WhatsApp numbers should be at least 7 digits and no more than 15
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

// Function to format phone number for WhatsApp
export const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it's a US number (10 digits), add country code
  if (digitsOnly.length === 10) {
    return `1${digitsOnly}`;
  }
  
  // If it already has a country code, return as is
  if (digitsOnly.length > 10) {
    return digitsOnly;
  }
  
  return digitsOnly;
};

// Utility function to send invitation via WhatsApp (opens user's WhatsApp)
export const sendWhatsAppInvitation = async (invitation: WhatsAppInvitation): Promise<{
  success: boolean;
  url: string;
  qrCode?: string;
  error?: string;
}> => {
  try {
    const url = generateWhatsAppURL(invitation);
    const qrResult = await generateWhatsAppQR(invitation);
    
    return {
      success: true,
      url,
      qrCode: qrResult.qrCode,
      error: undefined
    };
  } catch (error) {
    console.error('Failed to prepare WhatsApp invitation:', error);
    return {
      success: false,
      url: '',
      qrCode: undefined,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to get WhatsApp Business API message (if using Business API)
export const getWhatsAppBusinessMessage = (invitation: WhatsAppInvitation) => {
  return {
    messaging_product: "whatsapp",
    to: formatPhoneForWhatsApp(invitation.to),
    type: "text",
    text: {
      body: generateWhatsAppMessage(invitation)
    }
  };
}; 