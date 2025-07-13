import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/invitation-projects/[id] - Get specific invitation project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database or create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create user with minimal data if doesn't exist
      try {
        // Use a unique placeholder email to avoid constraint violations
        const placeholderEmail = `${userId}@placeholder.local`;
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: placeholderEmail, // Will be updated by webhook
            firstName: '',
            lastName: '',
            imageUrl: '',
          },
        });
      } catch (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    // Get the specific project
    const project = await prisma.invitationProject.findFirst({
      where: {
        id: params.id,
        createdBy: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update lastOpenedAt when project is accessed
    await prisma.invitationProject.update({
      where: { id: params.id },
      data: { lastOpenedAt: new Date() },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching invitation project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/invitation-projects/[id] - Update invitation project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database or create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create user with minimal data if doesn't exist
      try {
        // Use a unique placeholder email to avoid constraint violations
        const placeholderEmail = `${userId}@placeholder.local`;
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: placeholderEmail, // Will be updated by webhook
            firstName: '',
            lastName: '',
            imageUrl: '',
          },
        });
      } catch (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.invitationProject.findFirst({
      where: {
        id: params.id,
        createdBy: user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};

    // Allow updating specific fields
    const allowedFields = [
      'name',
      'description',
      'designData',
      'canvasWidth',
      'canvasHeight',
      'canvasRotation',
      'backgroundColor',
      'backgroundType',
      'backgroundGradient',
      'backgroundImage',
      'backgroundImageSettings',
      'isTemplate',
      'isPublic',
      'tags',
      'thumbnail'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Always update lastOpenedAt and increment version
    updateData.lastOpenedAt = new Date();
    updateData.version = existingProject.version + 1;

    // Update the project
    const updatedProject = await prisma.invitationProject.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error('Error updating invitation project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/invitation-projects/[id] - Delete invitation project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database or create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create user with minimal data if doesn't exist
      try {
        // Use a unique placeholder email to avoid constraint violations
        const placeholderEmail = `${userId}@placeholder.local`;
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: placeholderEmail, // Will be updated by webhook
            firstName: '',
            lastName: '',
            imageUrl: '',
          },
        });
      } catch (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    // Check if project exists and belongs to user
    const project = await prisma.invitationProject.findFirst({
      where: {
        id: params.id,
        createdBy: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete the project
    await prisma.invitationProject.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting invitation project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 