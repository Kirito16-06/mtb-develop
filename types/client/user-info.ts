
export interface IBlockUserParams {
  userId: string;
  reason: string;
}

export interface IPlan {
  name: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  jpEarned: number;
  jpBalance: number;
  createdAt: string;
  isBlocked: boolean;
  plan?: IPlan | null;

  isOnline : boolean

}
export interface IBlockUserResponse {
  message: string;
  user: IUser;
}