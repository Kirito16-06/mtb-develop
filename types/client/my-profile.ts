export interface ProfileResponse {
  profile: {
    name: string;
    bio?: string;
    image?: string | null;
  };
}
