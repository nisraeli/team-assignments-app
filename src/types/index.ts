export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  capacity: number; // hours per week
  skills: string[];
  avatarColor: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  estimatedHours: number;
  actualHours: number;
  dueDate: Date;
  createdDate: Date;
  tags: string[];
  project?: string;
}

export interface TimeEntry {
  id: string;
  assignmentId: string;
  memberId: string;
  hours: number;
  date: Date;
  description: string;
}

export interface Utilization {
  memberId: string;
  weekStart: Date;
  totalHours: number;
  capacityHours: number;
  utilizationPercentage: number;
  assignments: {
    assignmentId: string;
    hours: number;
  }[];
}

export type ViewType = 'dashboard' | 'team' | 'assignments' | 'utilization'; 