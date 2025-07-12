
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}
