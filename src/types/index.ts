export interface User {
  id: string;
  email: string;
  password: string;
  isInvited: boolean;
  invitedAt?: Date;
  lastLogin?: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  teamLeadId: string;
  memberIds: string[];
  color: string;
  createdDate: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  capacity: number; // hours per week
  skills: string[];
  avatarColor: string;
  teamId?: string;
  isTeamLead: boolean;
}

export interface ProjectAllocation {
  id: string;
  title: string;
  description: string;
  teamId: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  estimatedHours: number;
  actualHours: number;
  startDate: Date;
  endDate: Date;
  createdDate: Date;
  tags: string[];
  projectCode?: string;
  budget?: number;
}

export interface TimeEntry {
  id: string;
  allocationId: string;
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
  allocations: {
    allocationId: string;
    hours: number;
  }[];
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  pendingInvitations: string[];
}

export type ViewType = 'dashboard' | 'teams' | 'allocations' | 'utilization' | 'team-management'; 