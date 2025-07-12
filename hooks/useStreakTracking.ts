// Added by aaisha
// hooks/useStreakTracking.ts
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export function useLoginStreak() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    (async () => {
      try {
        await axios.post(`/api/login-streak/userStreak`, null, {
          headers: {
            'activity-type': 'login',
            // no userId header needed
          }
        });
      } catch (error) {
        console.error('Failed to track login streak:', error);
      }
    })();
  }, [session?.user?.id]);
}

export function useActivityStreak() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const timer = setTimeout(() => {
      (async () => {
        try {
          await axios.post(`/api/login-streak/userStreak`, null, {
            headers: {
              'activity-type': 'activity',
              // no userId header needed
            }
          });
        } catch (error) {
          console.error('Failed to track activity streak:', error);
        }
      })();
    }, 5000);

    return () => clearTimeout(timer);
  }, [session?.user?.id]);
}
