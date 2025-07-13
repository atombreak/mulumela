'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { DateTimePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { useUserSync } from '@/hooks/use-user-sync';
import moment from 'moment';

interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    guests: number;
    sentMessages: number;
  };
}

const EventsPage = () => {
  // Ensure user is synced with database
  useUserSync();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: undefined as Date | undefined,
    location: '',
  });

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);

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

  const resetForm = () => {
    setNewEvent({
      name: '',
      description: '',
      date: undefined,
      location: '',
    });
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
        setEvents([data.event, ...events]);
        setIsCreateDialogOpen(false);
        resetForm();
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

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      name: event.name,
      description: event.description || '',
      date: new Date(event.date),
      location: event.location || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !newEvent.name || !newEvent.date) {
      toast.error('Event name and date are required');
      return;
    }

    try {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
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
        setEvents(events.map(event => 
          event.id === editingEvent.id ? data.event : event
        ));
        setIsEditDialogOpen(false);
        setEditingEvent(null);
        resetForm();
        toast.success('Event updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId));
        toast.success('Event deleted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (filterStatus === 'upcoming') {
      return matchesSearch && eventDate > now;
    } else if (filterStatus === 'past') {
      return matchesSearch && eventDate < now;
    } else if (filterStatus === 'today') {
      return matchesSearch && eventDate.toDateString() === now.toDateString();
    }
    
    return matchesSearch;
  });

  const getEventStatus = (eventDate: string) => {
    const date = new Date(eventDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (eventDay.getTime() === today.getTime()) {
      return { label: 'Today', color: 'bg-green-100 text-green-800 border-green-200', icon: <AlertCircle className="w-3 h-3" /> };
    } else if (date > now) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="w-3 h-3" /> };
    } else {
      return { label: 'Past', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <CheckCircle className="w-3 h-3" /> };
    }
  };

  const formatDate = (dateString: string) => moment(dateString).format('dddd, MMMM D, YYYY');
  const formatTime = (dateString: string) => moment(dateString).format('h:mm A');

  const statsData = [
    {
      title: 'Total Events',
      value: events.length,
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
    },
    {
      title: 'Upcoming',
      value: events.filter(e => new Date(e.date) > new Date()).length,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
    },
    {
      title: 'Today',
      value: events.filter(e => {
        const today = new Date();
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === today.toDateString();
      }).length,
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-green-400 to-green-600',
    },
    {
      title: 'Total Guests',
      value: events.reduce((sum, event) => sum + event._count.guests, 0),
      icon: <Users className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Events</h1>
            <p className="text-gray-600">Create and manage your events</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
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
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('upcoming')}
            size="sm"
          >
            Upcoming
          </Button>
          <Button 
            variant={filterStatus === 'today' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('today')}
            size="sm"
          >
            Today
          </Button>
          <Button 
            variant={filterStatus === 'past' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('past')}
            size="sm"
          >
            Past
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first event'}
          </p>
          {!searchTerm && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event.date);
            
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{event.name}</CardTitle>
                      <Badge className={`${status.color} text-xs flex items-center gap-1 w-fit`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <Link href={`/invitations?eventId=${event.id}`}>
                          <DropdownMenuItem>
                            <Send className="w-4 h-4 mr-2" />
                            Send Invitations
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(event.date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {event._count.guests} guests
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editEventName">Event Name *</Label>
              <Input
                id="editEventName"
                value={newEvent.name}
                onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Birthday Party, Wedding, etc."
              />
            </div>
            <div>
              <Label htmlFor="editEventDescription">Description</Label>
              <Textarea
                id="editEventDescription"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="editEventDate">Date & Time *</Label>
              <DateTimePicker
                date={newEvent.date}
                onDateChange={(date) => setNewEvent(prev => ({ ...prev, date }))}
                placeholder="Select event date and time"
              />
            </div>
            <div>
              <Label htmlFor="editEventLocation">Location</Label>
              <Input
                id="editEventLocation"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Event location"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateEvent} className="flex-1">
                Update Event
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingEvent(null);
                  resetForm();
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
  );
};

export default EventsPage; 