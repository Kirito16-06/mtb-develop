// export type Frequency = "Daily" | "Monthly" | "Yearly";

export enum Frequency {
  "Daily",
  "Weekly",
  "Monthly"
} 

export interface DailyBloom {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  frequency?: Frequency | null;
  createdAt?: string;
  updatedAt: string;
  taskAddJP: boolean;
  taskCompleteJP: boolean;
}

export type FrequencyFilter = "Daily" | "Weekly" | "Monthly";
export type isDoneFilter = 'Completed' | 'Pending'

export type SelectProps = {
  freqBy: FrequencyFilter;
  compBy: isDoneFilter;

  onValueChange: (value: FrequencyFilter | isDoneFilter) => void;
};
