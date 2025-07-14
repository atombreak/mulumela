'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users, Search, Filter, Plus } from 'lucide-react';
import GuestList from './GuestList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  rsvpResponse?: string | null;
  respondedAt?: Date | null;
  invitationMethod: string[];
  event?: {
    id: string;
    name: string;
    date: Date;
    time?: string;
    location?: string;
  } | null;
  sentMessages: any[];
}

interface GuestDashboardProps {
  initialGuests: Guest[];
}

export default function GuestDashboard({ initialGuests }: GuestDashboardProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    invitationMethods: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate statistics
  const stats = {
    total: guests.length,
    invited: guests.filter(g => g.status === 'sent').length,
    confirmed: guests.filter(g => g.rsvpResponse === 'yes').length,
    declined: guests.filter(g => g.rsvpResponse === 'no').length,
  };

  // Filter guests based on search and status
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone?.includes(searchTerm);

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'invited') return matchesSearch && guest.status === 'sent';
    if (statusFilter === 'confirmed') return matchesSearch && guest.rsvpResponse === 'yes';
    if (statusFilter === 'declined') return matchesSearch && guest.rsvpResponse === 'no';
    if (statusFilter === 'pending') return matchesSearch && guest.status === 'pending';
    
    return matchesSearch;
  });

  const handleMethodToggle = (method: string) => {
    setNewGuest(prev => ({
      ...prev,
      invitationMethods: prev.invitationMethods.includes(method)
        ? prev.invitationMethods.filter(m => m !== method)
        : [...prev.invitationMethods, method]
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitations: [{
            name: newGuest.name,
            email: newGuest.email || undefined,
            phone: newGuest.phone || undefined,
            invitationMethods: newGuest.invitationMethods,
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add guest');
      }

      const data = await response.json();
      setGuests(prev => [...prev, ...data.invitations]);
      setIsAddGuestOpen(false);
      setNewGuest({
        name: '',
        email: '',
        phone: '',
        invitationMethods: [],
      });
      toast.success('Guest added successfully');
    } catch (error) {
      console.error('Error adding guest:', error);
      toast.error('Failed to add guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Guest Management</h1>
        <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter guest name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter guest email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter guest phone"
                />
              </div>
              <div className="space-y-2">
                <Label>Invitation Methods</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-method"
                      checked={newGuest.invitationMethods.includes('email')}
                      onCheckedChange={() => handleMethodToggle('email')}
                    />
                    <Label htmlFor="email-method">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms-method"
                      checked={newGuest.invitationMethods.includes('sms')}
                      onCheckedChange={() => handleMethodToggle('sms')}
                    />
                    <Label htmlFor="sms-method">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="whatsapp-method"
                      checked={newGuest.invitationMethods.includes('whatsapp')}
                      onCheckedChange={() => handleMethodToggle('whatsapp')}
                    />
                    <Label htmlFor="whatsapp-method">WhatsApp</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddGuestOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newGuest.name || isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Guest'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invited</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invited}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Declined</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.declined}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Guests</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Guest List */}
      <GuestList guests={filteredGuests} />
    </div>
  );
} 