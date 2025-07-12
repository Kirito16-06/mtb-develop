
export interface MiracleLog {
  id: string;
  content: string;
  createdAt: string;
}




export interface MiracleLogClientProps {
  initialLogs: MiracleLog[];
  initialStreak: { count: number };
}