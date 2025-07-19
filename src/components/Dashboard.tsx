import React from 'react';
import { useData } from '../context/DataContext';
import { Users, ClipboardList, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

function Dashboard() {
  const { teamMembers, assignments, getUtilization } = useData();

  const stats = {
    totalMembers: teamMembers.length,
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter((a: any) => a.status === 'in-progress').length,
    completedAssignments: assignments.filter((a: any) => a.status === 'completed').length,
  };

  const utilizationData = getUtilization();
  const avgUtilization = utilizationData.reduce((sum: number, util: any) => sum + util.utilizationPercentage, 0) / utilizationData.length || 0;

  const recentAssignments = assignments
    .sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'todo': return 'badge-todo';
      case 'in-progress': return 'badge-in-progress';
      case 'review': return 'badge-review';
      case 'completed': return 'badge-completed';
      default: return 'badge-todo';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'badge-low';
      case 'medium': return 'badge-medium';
      case 'high': return 'badge-high';
      case 'urgent': return 'badge-urgent';
      default: return 'badge-low';
    }
  };

  return (
    <div>
      <div className="header">
        <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b' }}>
          Overview of team assignments and utilization
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {stats.totalMembers}
          </div>
          <div className="stat-label">
            <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Team Members
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {stats.totalAssignments}
          </div>
          <div className="stat-label">
            <ClipboardList size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Total Assignments
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {stats.activeAssignments}
          </div>
          <div className="stat-label">
            <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Active Assignments
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {Math.round(avgUtilization)}%
          </div>
          <div className="stat-label">
            <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Avg Utilization
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Assignments</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentAssignments.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                No assignments found
              </p>
            ) : (
              recentAssignments.map(assignment => {
                const assignee = teamMembers.find(m => m.id === assignment.assigneeId);
                return (
                  <div key={assignment.id} style={{ 
                    padding: '1rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        {assignment.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className={`badge ${getStatusBadgeClass(assignment.status)}`}>
                          {assignment.status}
                        </span>
                        <span className={`badge ${getPriorityBadgeClass(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Assigned to: {assignee?.name || 'Unknown'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Team Utilization</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {utilizationData.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                No utilization data found
              </p>
            ) : (
              utilizationData.map(util => {
                const member = teamMembers.find(m => m.id === util.memberId);
                const utilizationClass = util.utilizationPercentage <= 70 ? 'utilization-low' :
                                       util.utilizationPercentage <= 90 ? 'utilization-medium' : 'utilization-high';
                
                return (
                  <div key={util.memberId} style={{ 
                    padding: '1rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '0.5rem' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div 
                          className="avatar avatar-sm"
                          style={{ backgroundColor: member?.avatarColor || '#64748b' }}
                        >
                          {member?.name.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                          {member?.name || 'Unknown'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        {util.utilizationPercentage}%
                      </span>
                    </div>
                    <div className="utilization-bar">
                      <div 
                        className={`utilization-fill ${utilizationClass}`}
                        style={{ width: `${Math.min(util.utilizationPercentage, 100)}%` }}
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {util.totalHours}h / {util.capacityHours}h capacity
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 