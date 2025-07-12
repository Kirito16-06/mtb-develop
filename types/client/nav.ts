
export type NavItemProps = {
  href: string;
  label: string;
  badge?: string | number;
}

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export type UserDropdownProps = {
  profilePicture?: string | null;
  userName?: string;
};