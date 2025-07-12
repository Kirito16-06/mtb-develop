export type SortKey = "jpEarned" | "jpSpent" | "jpBalance" | "jpTransaction";
export type SortSelectProps = {
  orderBy: SortKey;
  // page: number;
  // limit: number;
  onValueChange: (value: SortKey) => void;
};



export interface LeaderboardUser {
  id: string;
  name: string;
  image: string;
  category: string;
  jpEarned: number;
  jpSpent: number;
  jpTransaction: number;
  jpBalance: number;
  rank: number;
}
