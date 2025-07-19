import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { ViewType } from './types';
import Dashboard from './components/Dashboard';
import TeamMembers from './components/TeamMembers';
import Assignments from './components/Assignments';
import Utilization from './components/Utilization';
import { LayoutDashboard, Users, ClipboardList, BarChart3 } from 'lucide-react';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'team' as ViewType, label: 'Team Members', icon: Users },
    { id: 'assignments' as ViewType, label: 'Assignments', icon: ClipboardList },
    { id: 'utilization' as ViewType, label: 'Utilization', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'team':
        return <TeamMembers />;
      case 'assignments':
        return <Assignments />;
      case 'utilization':
        return <Utilization />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <LayoutDashboard size={24} />
            Team Manager
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
        </aside>
        
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </DataProvider>
  );
}

export default App; 