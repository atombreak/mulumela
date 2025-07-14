import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // First get the user's ID from our database
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const guests = await prisma.guest.findMany({
      where: {
        createdBy: user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            time: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error('[GUESTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 