import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ViewType } from './types';
import Dashboard from './components/Dashboard';
import Teams from './components/Teams';
import ProjectAllocations from './components/ProjectAllocations';
import Utilization from './components/Utilization';
import TeamManagement from './components/TeamManagement';
import Login from './components/Login';
import Register from './components/Register';
import { LayoutDashboard, Users, Briefcase, BarChart3, Settings, LogOut, Shield } from 'lucide-react';
import './App.css';

function AuthenticatedApp() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuthenticated) {
    if (showRegister) {
      return <Register onBackToLogin={() => setShowRegister(false)} />;
    }
    return <Login onRegisterClick={() => setShowRegister(true)} />;
  }

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teams' as ViewType, label: 'Teams', icon: Users },
    { id: 'allocations' as ViewType, label: 'Project Allocations', icon: Briefcase },
    { id: 'utilization' as ViewType, label: 'Utilization', icon: BarChart3 },
    { id: 'team-management' as ViewType, label: 'Team Management', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'teams':
        return <Teams />;
      case 'allocations':
        return <ProjectAllocations />;
      case 'utilization':
        return <Utilization />;
      case 'team-management':
        return <TeamManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <Shield size={24} />
            Project Manager
          </div>
          
          <div style={{ marginBottom: '1rem', padding: '1rem 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div 
                style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  borderRadius: '50%', 
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {currentUser?.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                  {currentUser?.email}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {currentUser?.email === 'admin@company.com' ? 'Administrator' : 'Team Member'}
                </p>
              </div>
            </div>
          </div>
          
          <nav>
            <ul className="nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.id}
                    className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentView(item.id)}
                  >
                    <Icon size={20} />
                    {item.label}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={logout}
              className="nav-item"
              style={{ 
                width: '100%', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: '#ef4444'
              }}
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>
        
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </DataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App; 