import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { TeamMember, Assignment, TimeEntry, Utilization } from '../types';
import { startOfWeek, addDays } from 'date-fns';

interface DataState {
  teamMembers: TeamMember[];
  assignments: Assignment[];
  timeEntries: TimeEntry[];
}

interface DataContextType extends DataState {
  addTeamMember: (member: Omit<TeamMember, 'id' | 'avatarColor'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdDate'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  getUtilization: (memberId?: string) => Utilization[];
  getMemberAssignments: (memberId: string) => Assignment[];
}

type DataAction =
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: { id: string; updates: Partial<TeamMember> } }
  | { type: 'DELETE_TEAM_MEMBER'; payload: string }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: { id: string; updates: Partial<Assignment> } }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'LOAD_DATA'; payload: DataState };

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const getRandomColor = () => {
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Initial sample data
const initialData: DataState = {
  teamMembers: [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'Senior Developer',
      department: 'Engineering',
      capacity: 40,
      skills: ['React', 'TypeScript', 'Node.js'],
      avatarColor: '#3B82F6'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'UX Designer',
      department: 'Design',
      capacity: 40,
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      avatarColor: '#8B5CF6'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      role: 'Product Manager',
      department: 'Product',
      capacity: 40,
      skills: ['Product Strategy', 'Agile', 'Analytics'],
      avatarColor: '#10B981'
    }
  ],
  assignments: [
    {
      id: '1',
      title: 'Implement user authentication',
      description: 'Create login/logout functionality with JWT tokens',
      assigneeId: '1',
      priority: 'high',
      status: 'in-progress',
      estimatedHours: 16,
      actualHours: 8,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdDate: new Date(),
      tags: ['Backend', 'Security'],
      project: 'Web Platform'
    },
    {
      id: '2',
      title: 'Design new dashboard layout',
      description: 'Create mockups and prototypes for the new admin dashboard',
      assigneeId: '2',
      priority: 'medium',
      status: 'todo',
      estimatedHours: 12,
      actualHours: 0,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdDate: new Date(),
      tags: ['Design', 'UI'],
      project: 'Admin Panel'
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
        teamMembers: state.teamMembers.map(member =>
          member.id === action.payload.id ? { ...member, ...action.payload.updates } : member
        )
      };
    case 'DELETE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(member => member.id !== action.payload),
        assignments: state.assignments.filter(assignment => assignment.assigneeId !== action.payload)
      };
    case 'ADD_ASSIGNMENT':
      return { ...state, assignments: [...state.assignments, action.payload] };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload.id ? { ...assignment, ...action.payload.updates } : assignment
        )
      };
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(assignment => assignment.id !== action.payload),
        timeEntries: state.timeEntries.filter(entry => entry.assignmentId !== action.payload)
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
    const savedData = localStorage.getItem('teamAssignmentsData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const data = {
          ...parsed,
          assignments: parsed.assignments.map((assignment: any) => ({
            ...assignment,
            dueDate: new Date(assignment.dueDate),
            createdDate: new Date(assignment.createdDate)
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
    localStorage.setItem('teamAssignmentsData', JSON.stringify(state));
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

  const addAssignment = (assignment: Omit<Assignment, 'id' | 'createdDate'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: generateId(),
      createdDate: new Date()
    };
    dispatch({ type: 'ADD_ASSIGNMENT', payload: newAssignment });
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: { id, updates } });
  };

  const deleteAssignment = (id: string) => {
    dispatch({ type: 'DELETE_ASSIGNMENT', payload: id });
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
      const assignments = memberTimeEntries.reduce((acc: { assignmentId: string; hours: number }[], entry: TimeEntry) => {
        const existing = acc.find((a: { assignmentId: string; hours: number }) => a.assignmentId === entry.assignmentId);
        if (existing) {
          existing.hours += entry.hours;
        } else {
          acc.push({ assignmentId: entry.assignmentId, hours: entry.hours });
        }
        return acc;
      }, [] as { assignmentId: string; hours: number }[]);

      return {
        memberId: member.id,
        weekStart,
        totalHours,
        capacityHours: member.capacity,
        utilizationPercentage: Math.round((totalHours / member.capacity) * 100),
        assignments
      };
    });
  };

  const getMemberAssignments = (memberId: string): Assignment[] => {
    return state.assignments.filter((assignment: Assignment) => assignment.assigneeId === memberId);
  };

  const value: DataContextType = {
    ...state,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addTimeEntry,
    getUtilization,
    getMemberAssignments
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