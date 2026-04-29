export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'Skill' | 'Build' | 'Fitness' | 'Habit';
  progress: number;
  status: 'active' | 'completed' | 'forfeited';
  days: number;
  stake: string;
  curve: number[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface Verification {
  id: string;
  goalId: string;
  service: 'github' | 'calendar' | 'health' | 'gps';
  status: 'connected' | 'pending' | 'failed';
  lastSync?: string;
}

export interface UserStats {
  activeGoals: number;
  forgeScore: number;
  weekProgress: number;
}
