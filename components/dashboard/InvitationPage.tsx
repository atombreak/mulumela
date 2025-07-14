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
              <DialogContent>
                {/* Event creation dialog content */}
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Invitation
                </Button>
              </DialogTrigger>
              <DialogContent>
                {/* Invitation creation dialog content */}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invitations</p>
                <h3 className="text-2xl font-bold text-gray-900">{invitations.length}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {invitations.filter(i => i.status === 'accepted').length}
                </h3>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {invitations.filter(i => i.status === 'pending').length}
                </h3>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Declined</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {invitations.filter(i => i.status === 'declined').length}
                </h3>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="mt-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="designer">Designer</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
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
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getStatusColor(invitation.status)}>
                        {getStatusIcon(invitation.status)}
                        <span className="ml-1">{invitation.status}</span>
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
                            Resend
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