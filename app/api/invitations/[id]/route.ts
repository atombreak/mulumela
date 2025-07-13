import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/invitations/[id] - Get a specific invitation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
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

    // Get the specific invitation
    const invitation = await prisma.guest.findFirst({
      where: {
        id: params.id,
        createdBy: user.id, // Ensure user can only access their own invitations
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/invitations/[id] - Update a specific invitation
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
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
    const { name, email, phone, gender, invited, attended } = body;

    // Check if invitation exists and belongs to the user
    const existingInvitation = await prisma.guest.findFirst({
      where: {
        id: params.id,
        createdBy: user.id,
      },
    });

    if (!existingInvitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Update the invitation
    const updatedInvitation = await prisma.guest.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(gender && { gender }),
        ...(invited !== undefined && { invited }),
        ...(attended !== undefined && { attended }),
      },
    });

    return NextResponse.json({ invitation: updatedInvitation });
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/invitations/[id] - Delete a specific invitation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
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

    // Check if invitation exists and belongs to the user
    const existingInvitation = await prisma.guest.findFirst({
      where: {
        id: params.id,
        createdBy: user.id,
      },
    });

    if (!existingInvitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Delete the invitation
    await prisma.guest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 