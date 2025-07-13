'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.emailAddresses[0]?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            imageUrl: user.imageUrl || '',
          }),
        });

        if (!response.ok) {
          console.error('Failed to sync user:', response.statusText);
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    }

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
} 