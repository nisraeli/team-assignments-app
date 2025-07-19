import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendInvitation: (email: string) => void;
  acceptInvitation: (email: string, password: string) => Promise<boolean>;
  isEmailInvited: (email: string) => boolean;
  makeUserAdmin: (userId: string) => void;
  removeUserAdmin: (userId: string) => void;
  getAllUsers: () => User[];
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SEND_INVITATION'; payload: string }
  | { type: 'ACCEPT_INVITATION'; payload: User }
  | { type: 'LOAD_AUTH_STATE'; payload: AuthState };

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const initialAuthState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  pendingInvitations: []
};

// Sample admin user for demo purposes
const defaultUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    password: 'admin123',
    isInvited: true,
    isAdmin: true,
    invitedAt: new Date(),
    lastLogin: new Date()
  }
];

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOAD_AUTH_STATE':
      return action.payload;
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        currentUser: { ...action.payload, lastLogin: new Date() }
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null
      };
    case 'SEND_INVITATION':
      return {
        ...state,
        pendingInvitations: [...state.pendingInvitations, action.payload]
      };
    case 'ACCEPT_INVITATION':
      return {
        ...state,
        pendingInvitations: state.pendingInvitations.filter(email => email !== action.payload.email),
        isAuthenticated: true,
        currentUser: action.payload
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuthState = localStorage.getItem('authState');
    const savedUsers = localStorage.getItem('users');
    
    if (savedAuthState) {
      try {
        const parsed = JSON.parse(savedAuthState);
        // Convert date strings back to Date objects
        const authState = {
          ...parsed,
          currentUser: parsed.currentUser ? {
            ...parsed.currentUser,
            invitedAt: parsed.currentUser.invitedAt ? new Date(parsed.currentUser.invitedAt) : undefined,
            lastLogin: parsed.currentUser.lastLogin ? new Date(parsed.currentUser.lastLogin) : undefined
          } : null
        };
        dispatch({ type: 'LOAD_AUTH_STATE', payload: authState });
      } catch (error) {
        console.error('Failed to load auth state from localStorage:', error);
      }
    }

    // Initialize default users if none exist
    if (!savedUsers) {
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Save auth state to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(state));
  }, [state]);

  const getUsers = (): User[] => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, lastLogin: new Date() } : u
      );
      saveUsers(updatedUsers);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { ...user, lastLogin: new Date() } });
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const sendInvitation = (email: string) => {
    // Check if email is already invited or user exists
    const users = getUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (!existingUser && !state.pendingInvitations.includes(email)) {
      dispatch({ type: 'SEND_INVITATION', payload: email });
      
      // In a real app, you would send an actual email here
      console.log(`Invitation sent to: ${email}`);
      alert(`Invitation sent to ${email}. They can now register with this email.`);
    } else {
      alert('User already exists or invitation already sent.');
    }
  };

  const acceptInvitation = async (email: string, password: string): Promise<boolean> => {
    if (state.pendingInvitations.includes(email)) {
      const users = getUsers();
      const newUser: User = {
        id: generateId(),
        email,
        password,
        isInvited: true,
        isAdmin: false, // New users are not admin by default
        invitedAt: new Date(),
        lastLogin: new Date()
      };
      
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      
      dispatch({ type: 'ACCEPT_INVITATION', payload: newUser });
      return true;
    }
    return false;
  };

  const makeUserAdmin = (userId: string) => {
    const users = getUsers();
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isAdmin: true } : u
    );
    saveUsers(updatedUsers);
    
    // Update current user if it's the same user
    if (state.currentUser?.id === userId) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { ...state.currentUser, isAdmin: true } });
    }
  };

  const removeUserAdmin = (userId: string) => {
    const users = getUsers();
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isAdmin: false } : u
    );
    saveUsers(updatedUsers);
    
    // Update current user if it's the same user
    if (state.currentUser?.id === userId) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { ...state.currentUser, isAdmin: false } });
    }
  };

  const getAllUsers = (): User[] => {
    return getUsers();
  };

  const isEmailInvited = (email: string): boolean => {
    const users = getUsers();
    return state.pendingInvitations.includes(email) || users.some(u => u.email === email);
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    sendInvitation,
    acceptInvitation,
    isEmailInvited,
    makeUserAdmin,
    removeUserAdmin,
    getAllUsers
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 