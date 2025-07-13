'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  User, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  MessageSquare,
  QrCode,
  MapPin,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import moment from 'moment';
import InvitationDesigner from './InvitationDesigner';

interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  _count: {
    guests: number;
    sentMessages: number;
  };
}

interface Invitation {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  status: 'pending' | 'sent' | 'accepted' | 'declined';
  customMessage?: string;
  invitationMethod: string[];
  respondedAt: string | null;
  rsvpResponse?: string;
  createdAt: string;
  event?: Event;
  sentMessages: any[];
  _count: {
    sentMessages: number;
  };
}

const InvitationPage = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    eventId: '',
    customMessage: '',
    invitationMethods: [] as string[],
    sendImmediately: false,
  });
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: undefined as Date | undefined,
    location: '',
  });

  // Fetch data
  useEffect(() => {
    fetchInvitations();
    fetchEvents();
  }, []);

  // Pre-select event if eventId is provided in URL
  useEffect(() => {
    if (eventId && events.length > 0) {
      const foundEvent = events.find(event => event.id === eventId);
      if (foundEvent) {
        setNewInvitation(prev => ({ ...prev, eventId: eventId }));
        setIsCreateDialogOpen(true);
      }
    }
  }, [eventId, events]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      } else {
        toast.error('Failed to fetch invitations');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to fetch invitations');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invitation.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleMethodToggle = (method: string) => {
    setNewInvitation(prev => ({
      ...prev,
      invitationMethods: prev.invitationMethods.includes(method)
        ? prev.invitationMethods.filter(m => m !== method)
        : [...prev.invitationMethods, method]
    }));
  };

  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.date) {
      toast.error('Event name and date are required');
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newEvent.name,
          description: newEvent.description,
          date: newEvent.date.toISOString(),
          time: newEvent.date.toTimeString().slice(0, 5),
          location: newEvent.location,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(prev => [data.event, ...prev]);
        setNewEvent({
          name: '',
          description: '',
          date: undefined,
          location: '',
        });
        setIsCreateEventDialogOpen(false);
        toast.success('Event created successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleCreateInvitation = async () => {
    if (!newInvitation.name) {
      toast.error('Guest name is required');
      return;
    }

    if (newInvitation.sendImmediately && newInvitation.invitationMethods.length === 0) {
      toast.error('Please select at least one communication method to send invitation');
      return;
    }

    if (newInvitation.sendImmediately) {
      if (newInvitation.invitationMethods.includes('email') && !newInvitation.email) {
        toast.error('Email is required when sending via email');
        return;
      }
      if ((newInvitation.invitationMethods.includes('sms') || newInvitation.invitationMethods.includes('whatsapp')) && !newInvitation.phone) {
        toast.error('Phone number is required when sending via SMS or WhatsApp');
        return;
      }
    }

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newInvitation.name,
          email: newInvitation.email,
          phone: newInvitation.phone,
          gender: newInvitation.gender,
          eventId: newInvitation.eventId || null,
          customMessage: newInvitation.customMessage,
          invitationMethods: newInvitation.invitationMethods,
          sendImmediately: newInvitation.sendImmediately,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(prev => [data.invitation, ...prev]);
        setNewInvitation({
          name: '',
          email: '',
          phone: '',
          gender: '',
          eventId: '',
          customMessage: '',
          invitationMethods: [],
          sendImmediately: false,
        });
        setIsCreateDialogOpen(false);
        
        if (data.sendingResults) {
          const successCount = data.sendingResults.filter((r: any) => r.success).length;
          const failureCount = data.sendingResults.length - successCount;
          
          if (successCount > 0) {
            toast.success(`Invitation created and sent via ${successCount} method(s)!`);
          }
          if (failureCount > 0) {
            toast.error(`Failed to send via ${failureCount} method(s)`);
          }

          // Show WhatsApp QR code if available
          const whatsappResult = data.sendingResults.find((r: any) => r.method === 'whatsapp');
          if (whatsappResult?.qrCode) {
            // Could show QR code in a modal here
            console.log('WhatsApp QR Code:', whatsappResult.qrCode);
          }
        } else {
          toast.success('Invitation created successfully!');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create invitation');
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error('Failed to create invitation');
    }
  };

  const statsData = [
    {
      title: 'Total Invitations',
      value: invitations.length,
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
    },
    {
      title: 'Accepted',
      value: invitations.filter(i => i.status === 'accepted').length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-green-400 to-green-600',
    },
    {
      title: 'Pending',
      value: invitations.filter(i => i.status === 'pending' || i.status === 'sent').length,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    },
    {
      title: 'Declined',
      value: invitations.filter(i => i.status === 'declined').length,
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-red-400 to-red-600',
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Invitations</h1>
            <p className="text-gray-600">Manage and track your event invitations</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isCreateEventDialogOpen} onOpenChange={setIsCreateEventDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventName">Event Name *</Label>
                    <Input
                      id="eventName"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Birthday Party, Wedding, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventDescription">Description</Label>
                    <Textarea
                      id="eventDescription"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Event description..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventDate">Date & Time *</Label>
                    <DateTimePicker
                      date={newEvent.date}
                      onDateChange={(date) => setNewEvent(prev => ({ ...prev, date }))}
                      placeholder="Select event date and time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventLocation">Location</Label>
                    <Input
                      id="eventLocation"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Event location"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateEvent} className="flex-1">
                      Create Event
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateEventDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Invitation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invitation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Guest Name *</Label>
                    <Input
                      id="name"
                      value={newInvitation.name}
                      onChange={(e) => setNewInvitation(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newInvitation.email}
                      onChange={(e) => setNewInvitation(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="guest@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newInvitation.phone}
                      onChange={(e) => setNewInvitation(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={newInvitation.gender} 
                      onValueChange={(value) => setNewInvitation(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="event">Event</Label>
                    <Select 
                      value={newInvitation.eventId} 
                      onValueChange={(value) => setNewInvitation(prev => ({ ...prev, eventId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name} - {moment(event.date).format('ll')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Custom Message</Label>
                    <Textarea
                      id="message"
                      value={newInvitation.customMessage}
                      onChange={(e) => setNewInvitation(prev => ({ ...prev, customMessage: e.target.value }))}
                      placeholder="Add a personal message..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Communication Methods</Label>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email-method"
                          checked={newInvitation.invitationMethods.includes('email')}
                          onCheckedChange={() => handleMethodToggle('email')}
                        />
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          <Label htmlFor="email-method">Email</Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sms-method"
                          checked={newInvitation.invitationMethods.includes('sms')}
                          onCheckedChange={() => handleMethodToggle('sms')}
                        />
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                          <Label htmlFor="sms-method">SMS</Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="whatsapp-method"
                          checked={newInvitation.invitationMethods.includes('whatsapp')}
                          onCheckedChange={() => handleMethodToggle('whatsapp')}
                        />
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-green-600" />
                          <Label htmlFor="whatsapp-method">WhatsApp</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-immediately"
                      checked={newInvitation.sendImmediately}
                      onCheckedChange={(checked) => setNewInvitation(prev => ({ ...prev, sendImmediately: !!checked }))}
                    />
                    <Label htmlFor="send-immediately">Send invitation immediately</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateInvitation} className="flex-1">
                      {newInvitation.sendImmediately ? 'Create & Send' : 'Create Invitation'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="manage">Manage Invitations</TabsTrigger>
          <TabsTrigger value="designer">Design Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statsData.map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-4 sm:p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="opacity-80">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invitations List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredInvitations.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Create your first invitation to get started.'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invitation
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInvitations.map((invitation) => (
              <div key={invitation.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      invitation.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{invitation.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                        {invitation.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {invitation.email}
                          </div>
                        )}
                        {invitation.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {invitation.phone}
                          </div>
                        )}
                      </div>
                      {invitation.event && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {invitation.event.name}
                          {invitation.event.location && (
                            <>
                              <MapPin className="w-4 h-4 ml-2 mr-1" />
                              {invitation.event.location}
                            </>
                          )}
                        </div>
                      )}
                      {invitation.invitationMethod.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {invitation.invitationMethod.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method === 'email' && <Mail className="w-3 h-3 mr-1" />}
                              {method === 'sms' && <MessageSquare className="w-3 h-3 mr-1" />}
                              {method === 'whatsapp' && <Phone className="w-3 h-3 mr-1" />}
                              {method.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getStatusColor(invitation.status)} border`}>
                      {getStatusIcon(invitation.status)}
                      <span className="ml-1 capitalize">{invitation.status}</span>
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="w-4 h-4 mr-2" />
                          WhatsApp QR
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </TabsContent>

        <TabsContent value="designer">
          <InvitationDesigner
            event={events.find(e => e.id === newInvitation.eventId)}
            guestName={newInvitation.name}
            onSave={(designData) => {
              console.log('Design saved:', designData);
              toast.success('Design saved successfully!');
            }}
            onExport={(imageUrl) => {
              console.log('Design exported:', imageUrl);
              toast.success('Design exported successfully!');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvitationPage; 