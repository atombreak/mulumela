# Enhanced Invitation System with Multi-Channel Communication

This document describes the enhanced invitation management system built for Mulumela with email, SMS, WhatsApp functionality, and Radix date pickers.

## 🚀 Features Implemented

### ✅ Core Features
- **Event Management**: Create and manage events with date, time, location
- **Guest Management**: Add guests with contact information and preferences  
- **Multi-Channel Communication**: Send invitations via Email, SMS, and WhatsApp
- **Radix Date Pickers**: Beautiful date/time selection for events
- **Real-time Status Tracking**: Track invitation delivery and responses
- **RSVP Management**: Handle guest responses and attendance tracking

### ✅ Communication Channels

#### 📧 Email (Resend)
- Beautiful HTML email templates with event details
- Automated reminder emails
- Thank you emails for attendees
- Custom branding and messaging

#### 📱 SMS (Twilio)
- Formatted text messages with event information
- International phone number support
- Delivery status tracking
- Custom message templates

#### 💬 WhatsApp
- WhatsApp Web links for easy sharing
- QR codes for quick access
- Rich text formatting with emojis
- Deep linking to WhatsApp app

### ✅ Database Schema
Enhanced database with new models:
- **Event**: Store event information and details
- **Guest**: Enhanced with communication preferences and status
- **SentMessage**: Track all communication attempts and delivery status

### ✅ API Endpoints

#### Events
- `GET /api/events` - List user's events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

#### Invitations
- `GET /api/invitations` - List user's invitations with status
- `POST /api/invitations` - Create invitation (with optional immediate sending)
- `POST /api/invitations/[id]/send` - Send invitation via selected methods

### ✅ UI Components

#### Date Pickers
- `DatePicker`: Single date selection
- `DateTimePicker`: Date and time selection with time input
- `DateRangePicker`: Date range selection for events

#### Enhanced Forms
- Multi-step invitation creation
- Communication method selection with checkboxes
- Event association and management
- Custom message and template options

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install resend twilio qrcode @types/qrcode date-fns
```

### 2. Environment Variables
Add these to your `.env.local`:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=Your Name <noreply@yourdomain.com>

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=ACyour_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Push the updated schema
npx prisma db push

# Generate the client
npx prisma generate
```

### 4. Service Configuration

#### Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Configure domain (optional but recommended)

#### Twilio Setup
1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Purchase a phone number for SMS

## 📱 Usage Examples

### Creating an Event
```javascript
const event = await fetch('/api/events', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Birthday Party',
    description: 'Join us for a celebration!',
    date: '2024-12-25T18:00:00Z',
    time: '18:00',
    location: '123 Party Street'
  })
});
```

### Sending Multi-Channel Invitation
```javascript
const invitation = await fetch('/api/invitations', {
  method: 'POST',
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    eventId: 'event_id',
    invitationMethods: ['email', 'sms', 'whatsapp'],
    sendImmediately: true,
    customMessage: 'Hope to see you there!'
  })
});
```

### Sending Individual Reminders
```javascript
const reminder = await fetch(`/api/invitations/${invitationId}/send`, {
  method: 'POST',
  body: JSON.stringify({
    methods: ['email'],
    customMessage: 'Just a friendly reminder!'
  })
});
```

## 🎨 UI Components Usage

### Date Time Picker
```jsx
import { DateTimePicker } from '@/components/ui/date-picker';

<DateTimePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Select event date and time"
  showTime={true}
/>
```

### Communication Method Selection
```jsx
const [methods, setMethods] = useState([]);

const handleMethodToggle = (method) => {
  setMethods(prev => 
    prev.includes(method) 
      ? prev.filter(m => m !== method)
      : [...prev, method]
  );
};

<Checkbox
  checked={methods.includes('email')}
  onCheckedChange={() => handleMethodToggle('email')}
/>
```

## 📊 Service Functions

### Email Service (`lib/services/email.ts`)
- `sendInvitationEmail(invitation)` - Send invitation with template
- `sendReminderEmail(invitation)` - Send reminder notification
- `sendThankYouEmail(invitation, attended)` - Post-event follow-up

### SMS Service (`lib/services/sms.ts`)
- `sendInvitationSMS(invitation)` - Send formatted SMS invitation
- `sendReminderSMS(invitation)` - Send SMS reminder
- `sendThankYouSMS(invitation, attended)` - SMS follow-up
- `formatPhoneForSMS(phone)` - Phone number formatting
- `isValidPhoneNumber(phone)` - Phone validation

### WhatsApp Service (`lib/services/whatsapp.ts`)
- `sendWhatsAppInvitation(invitation)` - Generate WhatsApp link and QR
- `generateWhatsAppURL(invitation)` - Create wa.me link
- `generateWhatsAppQR(invitation)` - Generate QR code for sharing
- `generateWhatsAppReminderURL(invitation)` - Reminder link
- `generateWhatsAppThankYouURL(invitation, attended)` - Follow-up link

## 🔧 Customization

### Email Templates
Edit templates in `lib/services/email.ts`:
- Modify HTML structure and styling
- Add custom branding and colors
- Include additional event information

### SMS Templates
Update message templates in `lib/services/sms.ts`:
- Customize message format and emojis
- Add location links or additional details
- Modify character limits for international SMS

### WhatsApp Templates
Adjust WhatsApp message format in `lib/services/whatsapp.ts`:
- Update emoji usage and formatting
- Add rich text features (bold, italic)
- Include additional contact information

## 🚦 Status Tracking

### Invitation Statuses
- `pending`: Not yet sent
- `sent`: Successfully delivered
- `accepted`: Guest confirmed attendance
- `declined`: Guest declined invitation

### Message Tracking
All communication attempts are logged in the `SentMessage` model:
- Message type (invitation, reminder, thank_you)
- Communication method (email, sms, whatsapp)
- Delivery status and error handling
- External service message IDs

## 🔄 Future Enhancements

### Planned Features
- **Bulk Operations**: Send to multiple guests simultaneously
- **Template Management**: Create and save custom templates
- **Analytics Dashboard**: Track engagement and response rates
- **Calendar Integration**: Sync with Google Calendar, Outlook
- **RSVP Forms**: Custom forms with dietary preferences, +1 options
- **Automated Workflows**: Schedule reminders and follow-ups
- **WhatsApp Business API**: Direct message sending (not just links)
- **Multi-language Support**: Internationalization for templates

### Integration Opportunities
- **Payment Processing**: Collect event fees through invitations
- **Video Conferencing**: Auto-generate Zoom/Teams links
- **Social Media**: Share events on Facebook, LinkedIn
- **Location Services**: Integrate with Maps for directions
- **QR Check-in**: Generate QR codes for event check-in

## 🧪 Testing

### Manual Testing
1. Create test events with different date/time formats
2. Send invitations using all three communication methods
3. Test phone number validation and formatting
4. Verify email templates render correctly
5. Test WhatsApp links and QR codes

### API Testing
```bash
# Test event creation
curl -X POST /api/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Event","date":"2024-12-25T18:00:00Z"}'

# Test invitation sending
curl -X POST /api/invitations \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Guest","email":"test@example.com","sendImmediately":true,"invitationMethods":["email"]}'
```

## 📞 Support

### Troubleshooting
- **Email not sending**: Check Resend API key and domain configuration
- **SMS failures**: Verify Twilio credentials and phone number format
- **WhatsApp QR not generating**: Check QRCode library installation
- **Database errors**: Ensure schema is up to date with `npx prisma db push`

### Error Handling
All services include comprehensive error handling with:
- Detailed error messages and logging
- Graceful fallbacks for communication failures
- Status tracking for all attempts
- User-friendly error notifications

---

Built with ❤️ for Mulumela Event Management System 