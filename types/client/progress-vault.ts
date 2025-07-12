export interface ProgressVault {
  id: string;
  content: string;
  createdAt: string;
}


export interface ProgressVaultClientProps {
  initialLogs: ProgressVault[];
  initialStreak: { count: number };
}