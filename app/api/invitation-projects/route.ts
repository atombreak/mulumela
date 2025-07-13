import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/invitation-projects - Get all invitation projects for the current user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const isTemplate = searchParams.get('template') === 'true';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    // Build filter conditions
    const whereConditions: any = {
      createdBy: user.id,
    };

    if (isTemplate !== null) {
      whereConditions.isTemplate = isTemplate;
    }

    if (tags.length > 0) {
      whereConditions.tags = {
        hasSome: tags,
      };
    }

    // Get all invitation projects created by this user
    const projects = await prisma.invitationProject.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        canvasWidth: true,
        canvasHeight: true,
        backgroundColor: true,
        backgroundType: true,
        isTemplate: true,
        isPublic: true,
        tags: true,
        lastOpenedAt: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        // Don't include designData in list view for performance
      },
      orderBy: [
        { lastOpenedAt: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching invitation projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/invitation-projects - Create a new invitation project
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log('POST /api/invitation-projects - userId:', userId);
    
    if (!userId) {
      console.log('No userId found in auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database or create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    console.log('User found in database:', !!user);

    if (!user) {
      console.log('User not found in database for clerkId:', userId, '. Creating user...');
      
      try {
        // Create user with minimal data - Clerk webhook will update it later
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
        console.log('User created successfully:', user.id);
      } catch (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      designData,
      canvasWidth = 600,
      canvasHeight = 800,
      canvasRotation = 0,
      backgroundColor = '#ffffff',
      backgroundType = 'color',
      backgroundGradient,
      isTemplate = false,
      isPublic = false,
      tags = [],
      thumbnail
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create new invitation project
    console.log('Creating project with data:', { name, canvasWidth, canvasHeight, createdBy: user.id });
    
    const newProject = await prisma.invitationProject.create({
      data: {
        name,
        description,
        designData: designData || {},
        canvasWidth,
        canvasHeight,
        canvasRotation,
        backgroundColor,
        backgroundType,
        backgroundGradient,
        isTemplate,
        isPublic,
        tags,
        thumbnail,
        lastOpenedAt: new Date(),
        createdBy: user.id,
      },
    });

    console.log('Project created successfully:', newProject.id);
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 