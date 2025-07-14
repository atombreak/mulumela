'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
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
}

interface GuestListProps {
  guests: Guest[] | null;
}

export default function GuestList({ guests }: GuestListProps) {
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    invitationMethods: [] as string[],
  });

  const statusColors = {
    yes: 'bg-green-100 text-green-800',
    no: 'bg-red-100 text-red-800',
    maybe: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-800',
  };

  const getStatusColor = (status: string, response?: string | null) => {
    if (status !== 'responded') return statusColors.pending;
    return statusColors[response as keyof typeof statusColors] || statusColors.pending;
  };

  const getStatusText = (status: string, response?: string | null) => {
    if (status !== 'responded') return 'Pending';
    return response ? response.charAt(0).toUpperCase() + response.slice(1) : 'Pending';
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setEditForm({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      invitationMethods: [...guest.invitationMethod],
    });
    setIsEditDialogOpen(true);
  };

  const handleMethodToggle = (method: string) => {
    setEditForm(prev => ({
      ...prev,
      invitationMethods: prev.invitationMethods.includes(method)
        ? prev.invitationMethods.filter(m => m !== method)
        : [...prev.invitationMethods, method]
    }));
  };

  const handleUpdate = async () => {
    if (!editingGuest) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/invitations/${editingGuest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email || undefined,
          phone: editForm.phone || undefined,
          invitationMethod: editForm.invitationMethods,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update guest');
      }

      toast.success('Guest updated successfully');
      setIsEditDialogOpen(false);
      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating guest:', error);
      toast.error('Failed to update guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (guest: Guest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/invitations/${guest.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      toast.success('Guest deleted successfully');
      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Failed to delete guest');
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleResend = async (guest: Guest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/invitations/${guest.id}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to resend invitation');
      }

      toast.success('Invitation resent successfully');
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Guest List</h2>
          <Button onClick={() => setIsEditDialogOpen(true)}>
            Add Guest
          </Button>
        </div>
      </div>
      <div className="relative">
        {!guests ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Loading guests...</p>
          </div>
        ) : guests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-600">No guests found. Add your first guest to get started!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Invitation Method</TableHead>
                <TableHead>RSVP Status</TableHead>
                <TableHead>Response Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>
                    {guest.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {guest.email}
                      </div>
                    )}
                    {guest.phone && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        {guest.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.event ? (
                      <div>
                        <div className="font-medium">{guest.event.name}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(guest.event.date), 'PPP')}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {guest.invitationMethod.map((method) => (
                        <Badge key={method} variant="secondary">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(guest.status, guest.rsvpResponse)}>
                      {getStatusText(guest.status, guest.rsvpResponse)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {guest.respondedAt ? (
                      format(new Date(guest.respondedAt), 'PPp')
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(guest)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResend(guest)}>
                          <Send className="mr-2 h-4 w-4" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setEditingGuest(guest);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter guest name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter guest email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter guest phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Invitation Methods</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-email-method"
                    checked={editForm.invitationMethods.includes('email')}
                    onCheckedChange={() => handleMethodToggle('email')}
                  />
                  <Label htmlFor="edit-email-method">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-sms-method"
                    checked={editForm.invitationMethods.includes('sms')}
                    onCheckedChange={() => handleMethodToggle('sms')}
                  />
                  <Label htmlFor="edit-sms-method">SMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-whatsapp-method"
                    checked={editForm.invitationMethods.includes('whatsapp')}
                    onCheckedChange={() => handleMethodToggle('whatsapp')}
                  />
                  <Label htmlFor="edit-whatsapp-method">WhatsApp</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editForm.name || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Guest</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this guest? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => editingGuest && handleDelete(editingGuest)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Guest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 