import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      // If no user, redirect to sign in
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Get user data from Clerk
    const clerkUser = await currentUser();
    
    if (clerkUser) {
      // Ensure user exists in database
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!existingUser) {
        // Create user in database if doesn't exist
        await prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            imageUrl: clerkUser.imageUrl || '',
          },
        });
      }
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error in auth callback:', error);
    // Fallback redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }
} 