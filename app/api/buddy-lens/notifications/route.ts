
import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/auth.config';

// Helper to return error response
const errorResponse = (message: string, status: number = 400) =>
  NextResponse.json({ error: message }, { status });

// GET: Fetch notifications for the authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await NotificationService.getNotifications(session.user.id, unreadOnly);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('GET Error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

// PATCH: Mark a notification as read
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return errorResponse('Notification ID is required', 400);
    }

    await NotificationService.markAsRead(notificationId);
    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('PATCH Error:', error);
    return errorResponse('Failed to mark notification as read', 500);
  }
}
