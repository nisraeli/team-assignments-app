import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { TeamMember, ProjectAllocation, TimeEntry, Utilization, Team } from '../types';
import { startOfWeek, addDays } from 'date-fns';

interface DataState {
  teamMembers: TeamMember[];
  teams: Team[];
  projectAllocations: ProjectAllocation[];
  timeEntries: TimeEntry[];
}

interface DataContextType extends DataState {
  addTeamMember: (member: Omit<TeamMember, 'id' | 'avatarColor'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addTeam: (team: Omit<Team, 'id' | 'createdDate'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addProjectAllocation: (allocation: Omit<ProjectAllocation, 'id' | 'createdDate'>) => void;
  updateProjectAllocation: (id: string, updates: Partial<ProjectAllocation>) => void;
  deleteProjectAllocation: (id: string) => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  getUtilization: (memberId?: string) => Utilization[];
  getMemberAllocations: (memberId: string) => ProjectAllocation[];
  getTeamMembers: (teamId: string) => TeamMember[];
  getTeamAllocations: (teamId: string) => ProjectAllocation[];
  getTeamLead: (teamId: string) => TeamMember | undefined;
}

type DataAction =
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: { id: string; updates: Partial<TeamMember> } }
  | { type: 'DELETE_TEAM_MEMBER'; payload: string }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: { id: string; updates: Partial<Team> } }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'ADD_PROJECT_ALLOCATION'; payload: ProjectAllocation }
  | { type: 'UPDATE_PROJECT_ALLOCATION'; payload: { id: string; updates: Partial<ProjectAllocation> } }
  | { type: 'DELETE_PROJECT_ALLOCATION'; payload: string }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'LOAD_DATA'; payload: DataState };

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const getRandomColor = () => {
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Initial sample data
const initialData: DataState = {
  teams: [
    {
      id: '1',
      name: 'Frontend Development',
      description: 'Responsible for user interface and user experience',
      teamLeadId: '1',
      memberIds: ['1', '2'],
      color: '#3B82F6',
      createdDate: new Date()
    },
    {
      id: '2',
      name: 'Backend Development',
      description: 'Handles server-side logic and API development',
      teamLeadId: '3',
      memberIds: ['3', '4'],
      color: '#10B981',
      createdDate: new Date()
    },
    {
      id: '3',
      name: 'Product Management',
      description: 'Defines product strategy and roadmap',
      teamLeadId: '5',
      memberIds: ['5'],
      color: '#8B5CF6',
      createdDate: new Date()
    }
  ],
  teamMembers: [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'Senior Frontend Developer',
      department: 'Engineering',
      capacity: 40,
      skills: ['React', 'TypeScript', 'CSS'],
      avatarColor: '#3B82F6',
      teamId: '1',
      isTeamLead: true
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'UX Designer',
      department: 'Design',
      capacity: 40,
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      avatarColor: '#8B5CF6',
      teamId: '1',
      isTeamLead: false
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      role: 'Senior Backend Developer',
      department: 'Engineering',
      capacity: 40,
      skills: ['Node.js', 'PostgreSQL', 'AWS'],
      avatarColor: '#10B981',
      teamId: '2',
      isTeamLead: true
    },
    {
      id: '4',
      name: 'Lisa Rodriguez',
      email: 'lisa.r@company.com',
      role: 'Backend Developer',
      department: 'Engineering',
      capacity: 40,
      skills: ['Python', 'Django', 'Docker'],
      avatarColor: '#F59E0B',
      teamId: '2',
      isTeamLead: false
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'Product Manager',
      department: 'Product',
      capacity: 40,
      skills: ['Product Strategy', 'Agile', 'Analytics'],
      avatarColor: '#EF4444',
      teamId: '3',
      isTeamLead: true
    }
  ],
  projectAllocations: [
    {
      id: '1',
      title: 'E-commerce Platform Redesign',
      description: 'Complete redesign of the e-commerce platform UI/UX',
      teamId: '1',
      assigneeId: '1',
      priority: 'high',
      status: 'in-progress',
      estimatedHours: 120,
      actualHours: 45,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdDate: new Date(),
      tags: ['Frontend', 'UI/UX', 'E-commerce'],
      projectCode: 'ECOM-001',
      budget: 25000
    },
    {
      id: '2',
      title: 'API Performance Optimization',
      description: 'Improve API response times and database query optimization',
      teamId: '2',
      assigneeId: '3',
      priority: 'medium',
      status: 'planning',
      estimatedHours: 80,
      actualHours: 0,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      createdDate: new Date(),
      tags: ['Backend', 'Performance', 'Database'],
      projectCode: 'API-002',
      budget: 15000
    },
    {
      id: '3',
      title: 'Mobile App Feature Planning',
      description: 'Define roadmap and requirements for mobile app features',
      teamId: '3',
      assigneeId: '5',
      priority: 'high',
      status: 'in-progress',
      estimatedHours: 40,
      actualHours: 15,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdDate: new Date(),
      tags: ['Product', 'Mobile', 'Planning'],
      projectCode: 'MOB-003',
      budget: 8000
    }
  ],
  timeEntries: []
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;
    case 'ADD_TEAM_MEMBER':
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map((member: TeamMember) =>
          member.id === action.payload.id ? { ...member, ...action.payload.updates } : member
        )
      };
    case 'DELETE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter((member: TeamMember) => member.id !== action.payload),
        projectAllocations: state.projectAllocations.filter((allocation: ProjectAllocation) => allocation.assigneeId !== action.payload),
        teams: state.teams.map((team: Team) => ({
          ...team,
          memberIds: team.memberIds.filter(id => id !== action.payload),
          teamLeadId: team.teamLeadId === action.payload ? '' : team.teamLeadId
        }))
      };
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] };
    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map((team: Team) =>
          team.id === action.payload.id ? { ...team, ...action.payload.updates } : team
        )
      };
    case 'DELETE_TEAM':
      return {
        ...state,
        teams: state.teams.filter((team: Team) => team.id !== action.payload),
        projectAllocations: state.projectAllocations.filter((allocation: ProjectAllocation) => allocation.teamId !== action.payload),
        teamMembers: state.teamMembers.map((member: TeamMember) => ({
          ...member,
          teamId: member.teamId === action.payload ? undefined : member.teamId,
          isTeamLead: member.teamId === action.payload ? false : member.isTeamLead
        }))
      };
    case 'ADD_PROJECT_ALLOCATION':
      return { ...state, projectAllocations: [...state.projectAllocations, action.payload] };
    case 'UPDATE_PROJECT_ALLOCATION':
      return {
        ...state,
        projectAllocations: state.projectAllocations.map((allocation: ProjectAllocation) =>
          allocation.id === action.payload.id ? { ...allocation, ...action.payload.updates } : allocation
        )
      };
    case 'DELETE_PROJECT_ALLOCATION':
      return {
        ...state,
        projectAllocations: state.projectAllocations.filter((allocation: ProjectAllocation) => allocation.id !== action.payload),
        timeEntries: state.timeEntries.filter((entry: TimeEntry) => entry.allocationId !== action.payload)
      };
    case 'ADD_TIME_ENTRY':
      return { ...state, timeEntries: [...state.timeEntries, action.payload] };
    default:
      return state;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialData);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('teamProjectData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const data = {
          ...parsed,
          teams: parsed.teams.map((team: any) => ({
            ...team,
            createdDate: new Date(team.createdDate)
          })),
          projectAllocations: parsed.projectAllocations.map((allocation: any) => ({
            ...allocation,
            startDate: new Date(allocation.startDate),
            endDate: new Date(allocation.endDate),
            createdDate: new Date(allocation.createdDate)
          })),
          timeEntries: parsed.timeEntries.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date)
          }))
        };
        dispatch({ type: 'LOAD_DATA', payload: data });
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('teamProjectData', JSON.stringify(state));
  }, [state]);

  const addTeamMember = (member: Omit<TeamMember, 'id' | 'avatarColor'>) => {
    const newMember: TeamMember = {
      ...member,
      id: generateId(),
      avatarColor: getRandomColor()
    };
    dispatch({ type: 'ADD_TEAM_MEMBER', payload: newMember });
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: { id, updates } });
  };

  const deleteTeamMember = (id: string) => {
    dispatch({ type: 'DELETE_TEAM_MEMBER', payload: id });
  };

  const addTeam = (team: Omit<Team, 'id' | 'createdDate'>) => {
    const newTeam: Team = {
      ...team,
      id: generateId(),
      createdDate: new Date()
    };
    dispatch({ type: 'ADD_TEAM', payload: newTeam });
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    dispatch({ type: 'UPDATE_TEAM', payload: { id, updates } });
  };

  const deleteTeam = (id: string) => {
    dispatch({ type: 'DELETE_TEAM', payload: id });
  };

  const addProjectAllocation = (allocation: Omit<ProjectAllocation, 'id' | 'createdDate'>) => {
    const newAllocation: ProjectAllocation = {
      ...allocation,
      id: generateId(),
      createdDate: new Date()
    };
    dispatch({ type: 'ADD_PROJECT_ALLOCATION', payload: newAllocation });
  };

  const updateProjectAllocation = (id: string, updates: Partial<ProjectAllocation>) => {
    dispatch({ type: 'UPDATE_PROJECT_ALLOCATION', payload: { id, updates } });
  };

  const deleteProjectAllocation = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT_ALLOCATION', payload: id });
  };

  const addTimeEntry = (entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: generateId()
    };
    dispatch({ type: 'ADD_TIME_ENTRY', payload: newEntry });
  };

  const getUtilization = (memberId?: string): Utilization[] => {
    const members = memberId ? state.teamMembers.filter((m: TeamMember) => m.id === memberId) : state.teamMembers;
    const weekStart = startOfWeek(new Date());
    
    return members.map((member: TeamMember) => {
      const memberTimeEntries = state.timeEntries.filter(
        (entry: TimeEntry) => entry.memberId === member.id &&
        entry.date >= weekStart &&
        entry.date < addDays(weekStart, 7)
      );
      
      const totalHours = memberTimeEntries.reduce((sum: number, entry: TimeEntry) => sum + entry.hours, 0);
      const allocations = memberTimeEntries.reduce((acc: { allocationId: string; hours: number }[], entry: TimeEntry) => {
        const existing = acc.find((a: { allocationId: string; hours: number }) => a.allocationId === entry.allocationId);
        if (existing) {
          existing.hours += entry.hours;
        } else {
          acc.push({ allocationId: entry.allocationId, hours: entry.hours });
        }
        return acc;
      }, [] as { allocationId: string; hours: number }[]);

      return {
        memberId: member.id,
        weekStart,
        totalHours,
        capacityHours: member.capacity,
        utilizationPercentage: Math.round((totalHours / member.capacity) * 100),
        allocations
      };
    });
  };

  const getMemberAllocations = (memberId: string): ProjectAllocation[] => {
    return state.projectAllocations.filter((allocation: ProjectAllocation) => allocation.assigneeId === memberId);
  };

  const getTeamMembers = (teamId: string): TeamMember[] => {
    return state.teamMembers.filter((member: TeamMember) => member.teamId === teamId);
  };

  const getTeamAllocations = (teamId: string): ProjectAllocation[] => {
    return state.projectAllocations.filter((allocation: ProjectAllocation) => allocation.teamId === teamId);
  };

  const getTeamLead = (teamId: string): TeamMember | undefined => {
    const team = state.teams.find((t: Team) => t.id === teamId);
    if (!team) return undefined;
    return state.teamMembers.find((member: TeamMember) => member.id === team.teamLeadId);
  };

  const value: DataContextType = {
    ...state,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addTeam,
    updateTeam,
    deleteTeam,
    addProjectAllocation,
    updateProjectAllocation,
    deleteProjectAllocation,
    addTimeEntry,
    getUtilization,
    getMemberAllocations,
    getTeamMembers,
    getTeamAllocations,
    getTeamLead
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 