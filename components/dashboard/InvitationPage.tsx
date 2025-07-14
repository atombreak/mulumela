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
  Users,
  Upload,
  FileSpreadsheet,
  Plus as PlusIcon,
  Minus as MinusIcon
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
import { Card, CardContent } from '@/components/ui/card';
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

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  invited: boolean;
  attended: boolean;
  status: string;
  customMessage?: string;
  invitationMethod: string[];
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

const InvitationPage = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [invitations, setInvitations] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [newInvitations, setNewInvitations] = useState([{
    name: '',
    email: '',
    phone: '',
    gender: '',
    eventId: '',
    customMessage: '',
    invitationMethods: [] as string[],
    sendImmediately: false,
  }]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isImportMode, setIsImportMode] = useState(false);
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
        setNewInvitations(prev => prev.map(inv => ({ ...inv, eventId: eventId })));
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

  const handleMethodToggle = (method: string, index: number) => {
    setNewInvitations(prev => prev.map((invitation, i) => 
      i === index ? {
        ...invitation,
        invitationMethods: invitation.invitationMethods.includes(method)
          ? invitation.invitationMethods.filter(m => m !== method)
          : [...invitation.invitationMethods, method]
      } : invitation
    ));
  };

  const addGuestForm = () => {
    setNewInvitations(prev => [...prev, {
      name: '',
      email: '',
      phone: '',
      gender: '',
      eventId: prev[0].eventId, // Keep the same event
      customMessage: '',
      invitationMethods: [...prev[0].invitationMethods], // Keep the same methods
      sendImmediately: prev[0].sendImmediately, // Keep the same send preference
    }]);
  };

  const removeGuestForm = (index: number) => {
    setNewInvitations(prev => prev.filter((_, i) => i !== index));
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      const data = rows.slice(1)
        .filter(row => row.trim()) // Skip empty rows
        .map(row => {
          const values = row.split(',').map(v => v.trim());
          const guest: any = {};
          headers.forEach((header, index) => {
            guest[header] = values[index] || '';
          });
          return {
            name: guest.name || '',
            email: guest.email || '',
            phone: guest.phone || '',
            gender: guest.gender || '',
            eventId: newInvitations[0].eventId, // Use selected event
            customMessage: guest.message || '',
            invitationMethods: [], // Will be set in UI
            sendImmediately: false, // Will be set in UI
          };
        });

      setCsvData(data);
      setNewInvitations(data);
    };

    reader.readAsText(file);
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

  const handleCreateInvitations = async () => {
    // Validate all invitations
    for (const invitation of newInvitations) {
      if (!invitation.name) {
        toast.error('Guest name is required for all invitations');
        return;
      }

      if (invitation.sendImmediately && invitation.invitationMethods.length === 0) {
        toast.error('Please select at least one communication method to send invitations');
        return;
      }

      if (invitation.sendImmediately) {
        if (invitation.invitationMethods.includes('email') && !invitation.email) {
          toast.error(`Email is required for guest "${invitation.name}" when sending via email`);
          return;
        }
        if ((invitation.invitationMethods.includes('sms') || invitation.invitationMethods.includes('whatsapp')) && !invitation.phone) {
          toast.error(`Phone number is required for guest "${invitation.name}" when sending via SMS or WhatsApp`);
          return;
        }
      }
    }

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvitations),
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(prev => [...data.invitations, ...prev]);
        setNewInvitations([{
          name: '',
          email: '',
          phone: '',
          gender: '',
          eventId: '',
          customMessage: '',
          invitationMethods: [],
          sendImmediately: false,
        }]);
        setIsCreateDialogOpen(false);
        setCsvFile(null);
        setCsvData([]);
        setIsImportMode(false);
        
        const totalInvitations = data.invitations.length;
        const successfulSends = data.sendingResults?.filter((r: any) => r.success).length || 0;
        const failedSends = data.sendingResults?.length - successfulSends || 0;
        
        toast.success(`Created ${totalInvitations} invitation${totalInvitations > 1 ? 's' : ''}`);
        
        if (successfulSends > 0) {
          toast.success(`Successfully sent ${successfulSends} invitation${successfulSends > 1 ? 's' : ''}`);
        }
        if (failedSends > 0) {
          toast.error(`Failed to send ${failedSends} invitation${failedSends > 1 ? 's' : ''}`);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create invitations');
      }
    } catch (error) {
      console.error('Error creating invitations:', error);
      toast.error('Failed to create invitations');
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
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invitation{newInvitations.length > 1 ? 's' : ''}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Import/Manual Toggle */}
                  <div className="flex justify-center space-x-4 mb-6">
                    <Button
                      variant={isImportMode ? "outline" : "default"}
                      onClick={() => setIsImportMode(false)}
                    >
                      Manual Entry
                    </Button>
                    <Button
                      variant={isImportMode ? "default" : "outline"}
                      onClick={() => setIsImportMode(true)}
                    >
                      Import CSV
                    </Button>
                  </div>

                  {/* CSV Import Section */}
                  {isImportMode && (
                    <div className="space-y-4 border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <Label>Upload CSV File</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = 'data:text/csv;charset=utf-8,Name,Email,Phone,Gender,Message\n';
                            link.download = 'invitation_template.csv';
                            link.click();
                          }}
                        >
                          Download Template
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="flex-1"
                        />
                        {csvFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCsvFile(null);
                              setCsvData([]);
                              setNewInvitations([newInvitations[0]]);
                            }}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {csvFile && (
                        <p className="text-sm text-gray-500">
                          Loaded {csvData.length} guests from {csvFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Event Selection - Common for both modes */}
                  <div>
                    <Label htmlFor="event">Event</Label>
                    <Select 
                      value={newInvitations[0].eventId} 
                      onValueChange={(value) => {
                        setNewInvitations(prev => prev.map(invitation => ({
                          ...invitation,
                          eventId: value
                        })));
                      }}
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

                  {/* Manual Entry Forms */}
                  {!isImportMode && (
                    <div className="space-y-6">
                      {newInvitations.map((invitation, index) => (
                        <div key={index} className="border rounded-lg p-4 relative">
                          {/* Remove button for additional forms */}
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => removeGuestForm(index)}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`name-${index}`}>Guest Name *</Label>
                              <Input
                                id={`name-${index}`}
                                value={invitation.name}
                                onChange={(e) => {
                                  setNewInvitations(prev => prev.map((inv, i) => 
                                    i === index ? { ...inv, name: e.target.value } : inv
                                  ));
                                }}
                                placeholder="Enter guest name"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`email-${index}`}>Email</Label>
                              <Input
                                id={`email-${index}`}
                                type="email"
                                value={invitation.email}
                                onChange={(e) => {
                                  setNewInvitations(prev => prev.map((inv, i) => 
                                    i === index ? { ...inv, email: e.target.value } : inv
                                  ));
                                }}
                                placeholder="guest@example.com"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                              <Input
                                id={`phone-${index}`}
                                type="tel"
                                value={invitation.phone}
                                onChange={(e) => {
                                  setNewInvitations(prev => prev.map((inv, i) => 
                                    i === index ? { ...inv, phone: e.target.value } : inv
                                  ));
                                }}
                                placeholder="+1234567890"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`gender-${index}`}>Gender</Label>
                              <Select 
                                value={invitation.gender}
                                onValueChange={(value) => {
                                  setNewInvitations(prev => prev.map((inv, i) => 
                                    i === index ? { ...inv, gender: value } : inv
                                  ));
                                }}
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
                          </div>

                          <div className="mt-4">
                            <Label htmlFor={`message-${index}`}>Custom Message</Label>
                            <Textarea
                              id={`message-${index}`}
                              value={invitation.customMessage}
                              onChange={(e) => {
                                setNewInvitations(prev => prev.map((inv, i) => 
                                  i === index ? { ...inv, customMessage: e.target.value } : inv
                                ));
                              }}
                              placeholder="Add a personal message..."
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Add Guest Button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={addGuestForm}
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Another Guest
                      </Button>
                    </div>
                  )}

                  {/* Common Settings for All Guests */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">Invitation Settings</h3>
                    
                    <div className="space-y-2">
                      <Label>Communication Methods</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={newInvitations[0].invitationMethods.includes('email') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newMethods = newInvitations[0].invitationMethods.includes('email')
                              ? newInvitations[0].invitationMethods.filter(m => m !== 'email')
                              : [...newInvitations[0].invitationMethods, 'email'];
                            
                            setNewInvitations(prev => prev.map(inv => ({
                              ...inv,
                              invitationMethods: newMethods
                            })));
                          }}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button
                          variant={newInvitations[0].invitationMethods.includes('sms') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newMethods = newInvitations[0].invitationMethods.includes('sms')
                              ? newInvitations[0].invitationMethods.filter(m => m !== 'sms')
                              : [...newInvitations[0].invitationMethods, 'sms'];
                            
                            setNewInvitations(prev => prev.map(inv => ({
                              ...inv,
                              invitationMethods: newMethods
                            })));
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          SMS
                        </Button>
                        <Button
                          variant={newInvitations[0].invitationMethods.includes('whatsapp') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newMethods = newInvitations[0].invitationMethods.includes('whatsapp')
                              ? newInvitations[0].invitationMethods.filter(m => m !== 'whatsapp')
                              : [...newInvitations[0].invitationMethods, 'whatsapp'];
                            
                            setNewInvitations(prev => prev.map(inv => ({
                              ...inv,
                              invitationMethods: newMethods
                            })));
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-immediately"
                        checked={newInvitations[0].sendImmediately}
                        onCheckedChange={(checked) => {
                          setNewInvitations(prev => prev.map(inv => ({
                            ...inv,
                            sendImmediately: !!checked
                          })));
                        }}
                      />
                      <Label htmlFor="send-immediately">
                        Send invitation{newInvitations.length > 1 ? 's' : ''} immediately
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateInvitations} 
                      className="flex-1"
                      disabled={newInvitations.length === 0}
                    >
                      {newInvitations[0].sendImmediately 
                        ? `Create & Send ${newInvitations.length} Invitation${newInvitations.length > 1 ? 's' : ''}`
                        : `Create ${newInvitations.length} Invitation${newInvitations.length > 1 ? 's' : ''}`
                      }
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setNewInvitations([{
                          name: '',
                          email: '',
                          phone: '',
                          gender: '',
                          eventId: '',
                          customMessage: '',
                          invitationMethods: [],
                          sendImmediately: false,
                        }]);
                        setCsvFile(null);
                        setCsvData([]);
                        setIsImportMode(false);
                      }}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search invitations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invitations List */}
      <div className="space-y-4">
        {filteredInvitations.map((invitation) => (
          <Card key={invitation.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{invitation.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {invitation.email && (
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {invitation.email}
                        </span>
                      )}
                      {invitation.phone && (
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {invitation.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(invitation.status)} flex items-center`}
                  >
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
                        Send
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="mt-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="designer">Designer</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* List content is already shown above */}
        </TabsContent>

        <TabsContent value="designer">
          <InvitationDesigner
            event={events.find(e => e.id === newInvitations[0].eventId)}
            guestName={newInvitations[0].name}
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