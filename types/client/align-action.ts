// export interface AlignedAction {
//   id: string;
//   mood: string;
//   timeFrom: string;
//   timeTo: string;
//   category: string;
//   selectedTask: string;
//   tasks: string[];
//   completed: boolean;
// }

export interface ReminderListenerProps {
  onRefetch: () => void;
}

export interface AlignedAction {
  status?: string;
  id: string;
  mood: string;
  timeFrom: string;
  timeTo: string;
  category: string;
  selectedTask: string;
  tasks: string[];
  completed: boolean;
}