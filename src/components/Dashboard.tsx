import React from 'react';
import { useData } from '../context/DataContext';
import { Users, Briefcase, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

function Dashboard() {
  const { teamMembers, teams, projectAllocations, getUtilization } = useData();

  const stats = {
    totalMembers: teamMembers.length,
    totalTeams: teams.length,
    totalAllocations: projectAllocations.length,
    activeAllocations: projectAllocations.filter((a: any) => a.status === 'in-progress').length,
    completedAllocations: projectAllocations.filter((a: any) => a.status === 'completed').length,
  };

  const utilizationData = getUtilization();
  const avgUtilization = utilizationData.reduce((sum: number, util: any) => sum + util.utilizationPercentage, 0) / utilizationData.length || 0;

  const recentAllocations = projectAllocations
    .sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'planning': return 'badge-todo';
      case 'in-progress': return 'badge-in-progress';
      case 'review': return 'badge-review';
      case 'completed': return 'badge-completed';
      case 'on-hold': return 'badge-medium';
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
          Overview of teams, project allocations, and utilization
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {stats.totalTeams}
          </div>
          <div className="stat-label">
            <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Teams
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {stats.totalAllocations}
          </div>
          <div className="stat-label">
            <Briefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Project Allocations
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {stats.activeAllocations}
          </div>
          <div className="stat-label">
            <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Active Projects
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
            <h2 className="card-title">Recent Project Allocations</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentAllocations.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                No project allocations found
              </p>
            ) : (
              recentAllocations.map((allocation: any) => {
                const assignee = teamMembers.find((m: any) => m.id === allocation.assigneeId);
                const team = teams.find((t: any) => t.id === allocation.teamId);
                return (
                  <div key={allocation.id} style={{ 
                    padding: '1rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        {allocation.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${getStatusBadgeClass(allocation.status)}`}>
                          {allocation.status}
                        </span>
                        <span className={`badge ${getPriorityBadgeClass(allocation.priority)}`}>
                          {allocation.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {team && (
                        <>
                          <div 
                            style={{ 
                              width: '0.75rem', 
                              height: '0.75rem', 
                              borderRadius: '0.125rem', 
                              backgroundColor: team.color 
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {team.name}
                          </span>
                          <span style={{ color: '#e2e8f0' }}>•</span>
                        </>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Due: {format(new Date(allocation.endDate), 'MMM dd, yyyy')}</span>
                      <span>{allocation.actualHours}h / {allocation.estimatedHours}h</span>
                    </div>
                    
                    {allocation.projectCode && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <span className="skill-tag" style={{ fontSize: '0.65rem' }}>
                          {allocation.projectCode}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Team Overview</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {teams.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                No teams found
              </p>
            ) : (
              teams.slice(0, 4).map((team: any) => {
                const teamMembersCount = teamMembers.filter((m: any) => m.teamId === team.id).length;
                const teamAllocations = projectAllocations.filter((a: any) => a.teamId === team.id);
                const activeAllocations = teamAllocations.filter((a: any) => a.status === 'in-progress').length;
                
                return (
                  <div key={team.id} style={{ 
                    padding: '1rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '0.5rem' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '2rem', 
                          height: '2rem', 
                          borderRadius: '0.5rem', 
                          backgroundColor: team.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                          {team.name}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {teamMembersCount} members
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem' }}>
                      <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                          {activeAllocations}
                        </div>
                        <div style={{ color: '#64748b' }}>Active</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                          {teamAllocations.length}
                        </div>
                        <div style={{ color: '#64748b' }}>Total</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {teams.length > 4 && (
              <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                +{teams.length - 4} more teams
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          Quick Stats
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e', marginBottom: '0.25rem' }}>
              {projectAllocations.filter((a: any) => a.status === 'planning').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#92400e' }}>Planning</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1d4ed8', marginBottom: '0.25rem' }}>
              {stats.activeAllocations}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>In Progress</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fde2e8', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#be185d', marginBottom: '0.25rem' }}>
              {projectAllocations.filter((a: any) => a.status === 'review').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#be185d' }}>In Review</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#065f46', marginBottom: '0.25rem' }}>
              {stats.completedAllocations}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#065f46' }}>Completed</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.25rem' }}>
              {projectAllocations.filter((a: any) => a.status === 'on-hold').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>On Hold</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 