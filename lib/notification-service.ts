import {prisma} from '@/lib/prisma';


interface Notification {
  id: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export class NotificationService {
  // static async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
  //   try {
  //     const notifications = await prisma.userNotification.findMany({
  //       where: {
  //         userId,
  //         ...(unreadOnly ? { read: false } : {}),
  //       },
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //       select: {
  //         id: true,
  //         message: true,
  //         link: true,
  //         read: true,
  //         createdAt: true,
  //       },
  //     });

  //     return notifications.map((notification) => ({
  //       id: notification.id,
  //       message: notification.message,
  //       link: notification.link || undefined,
  //       read: notification.read,
  //       createdAt: notification.createdAt.toISOString(),
  //     }));
  //   } catch (err) {
  //     console.error('Error fetching notifications:', err);
  //     throw new Error('Failed to fetch notifications');
  //   }
  // }


  static async getNotifications(
    userId: string,
    unreadOnly: boolean = false,
    page: number = 1,
    limit: number = 10
  ): Promise<Notification[]> {
    try {
      const skip = (page - 1) * limit;
  
      const notifications = await prisma.userNotification.findMany({
        where: {
          userId,
          ...(unreadOnly ? { read: false } : {}),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: skip,
        select: {
          id: true,
          message: true,
          link: true,
          read: true,
          createdAt: true,
        },
      });
  
      return notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        link: notification.link || undefined,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error('Error fetching notifications:', err);
      throw new Error('Failed to fetch notifications');
    }
  }
  
  static async markAsRead(notificationId: string): Promise<void> {
    
    try {
      await prisma.userNotification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw new Error('Failed to mark notification as read');
    }
  }

  static async createNotification(userId: string, message: string, link?: string): Promise<void> {
    try {
      await prisma.userNotification.create({
        data: {
          userId,
          message,
          link,
          read: false,
        },
      });
    } catch (err) {
      console.error('Error creating notification:', err);
      throw new Error('Failed to create notification');
    }
  }
}
