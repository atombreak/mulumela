import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

async function validateRequest(request: NextRequest) {
  const headersList = await headers();
  const payloadString = await request.text();
  const svixHeaders = {
    'svix-id': headersList.get('svix-id')!,
    'svix-timestamp': headersList.get('svix-timestamp')!,
    'svix-signature': headersList.get('svix-signature')!,
  };
  const wh = new Webhook(webhookSecret);
  return wh.verify(payloadString, svixHeaders);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await validateRequest(request);
    
    const { type, data } = payload as any;

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

async function handleUserCreated(data: any) {
  try {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id);
    
    await prisma.user.create({
      data: {
        clerkId: id,
        email: primaryEmail?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        imageUrl: image_url || '',
      },
    });
    
    console.log(`User created: ${id}`);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

async function handleUserUpdated(data: any) {
  try {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id);
    
    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: primaryEmail?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        imageUrl: image_url || '',
      },
    });
    
    console.log(`User updated: ${id}`);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

async function handleUserDeleted(data: any) {
  try {
    const { id } = data;
    
    await prisma.user.delete({
      where: { clerkId: id },
    });
    
    console.log(`User deleted: ${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
} 