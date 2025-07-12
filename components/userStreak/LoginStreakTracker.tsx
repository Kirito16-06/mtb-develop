// components/LoginStreakTracker.tsx
// added by aaisha

'use client';

import { useLoginStreak } from '@/hooks/useStreakTracking';

export default function LoginStreakTracker() {
  useLoginStreak();
  return null;
}
