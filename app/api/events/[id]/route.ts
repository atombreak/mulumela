import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

// GET /api/events/[id] - Get specific event
export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get event with full details
    const event = await prisma.event.findFirst({
      where: { 
        id,
        createdBy: user.id 
      },
      include: {
        guests: {
          include: {
            sentMessages: {
              orderBy: { sentAt: 'desc' },
              take: 5, // Last 5 messages per guest
            }
          }
        },
        sentMessages: {
          orderBy: { sentAt: 'desc' },
        },
        _count: {
          select: {
            guests: true,
            sentMessages: true,
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, date, time, location } = body;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: { 
        id,
        createdBy: user.id 
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        date: date ? new Date(date) : undefined,
        time,
        location,
      },
      include: {
        guests: true,
        _count: {
          select: {
            guests: true,
            sentMessages: true,
          }
        }
      }
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: { 
        id,
        createdBy: user.id 
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete event (cascade will handle related records)
    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 