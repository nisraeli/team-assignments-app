import React from 'react';
import { useData } from '../context/DataContext';
import { BarChart3, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

function Utilization() {
  const { teamMembers, getUtilization, getMemberAssignments } = useData();
  const utilizationData = getUtilization();

  const getUtilizationColor = (percentage: number) => {
    if (percentage <= 70) return '#10b981'; // Green
    if (percentage <= 90) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getUtilizationStatus = (percentage: number) => {
    if (percentage <= 70) return 'Under-utilized';
    if (percentage <= 90) return 'Well-utilized';
    if (percentage <= 100) return 'Fully-utilized';
    return 'Over-utilized';
  };

  const getUtilizationIcon = (percentage: number) => {
    if (percentage <= 70) return TrendingDown;
    if (percentage <= 90) return Clock;
    return TrendingUp;
  };

  const overallUtilization = utilizationData.reduce((sum: number, util: any) => sum + util.utilizationPercentage, 0) / utilizationData.length || 0;

  return (
    <div>
      <div className="header">
        <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Team Utilization
        </h1>
        <p style={{ color: '#64748b' }}>
          Monitor team workload and capacity for the current week
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: getUtilizationColor(overallUtilization) }}>
            {Math.round(overallUtilization)}%
          </div>
          <div className="stat-label">
            <BarChart3 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Team Average
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {utilizationData.filter((u: any) => u.utilizationPercentage > 90).length}
          </div>
          <div className="stat-label">
            <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Over 90%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {utilizationData.filter((u: any) => u.utilizationPercentage <= 70).length}
          </div>
          <div className="stat-label">
            <TrendingDown size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Under 70%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {utilizationData.reduce((sum: number, util: any) => sum + util.totalHours, 0)}h
          </div>
          <div className="stat-label">
            <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Total Hours
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {utilizationData.map((util: any) => {
          const member = teamMembers.find((m: any) => m.id === util.memberId);
          const memberAssignments = getMemberAssignments(util.memberId);
          const utilizationColor = getUtilizationColor(util.utilizationPercentage);
          const utilizationStatus = getUtilizationStatus(util.utilizationPercentage);
          const UtilizationIcon = getUtilizationIcon(util.utilizationPercentage);
          
          return (
            <div key={util.memberId} className="card">
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div 
                    className="avatar"
                    style={{ backgroundColor: member?.avatarColor || '#64748b' }}
                  >
                    {member?.name.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                      {member?.name || 'Unknown'}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {member?.role || 'No role'} • {member?.department || 'No department'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UtilizationIcon size={16} style={{ color: utilizationColor }} />
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {utilizationStatus}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: utilizationColor }}>
                    {util.utilizationPercentage}%
                  </span>
                </div>

                <div className="utilization-bar">
                  <div 
                    className="utilization-fill"
                    style={{ 
                      width: `${Math.min(util.utilizationPercentage, 100)}%`,
                      backgroundColor: utilizationColor
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                  <span>{util.totalHours}h logged</span>
                  <span>{util.capacityHours}h capacity</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.75rem' }}>
                  Current Assignments ({memberAssignments.length})
                </h4>
                
                {memberAssignments.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
                    No active assignments
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {memberAssignments.slice(0, 3).map((assignment: any) => (
                      <div 
                        key={assignment.id} 
                        style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '0.5rem',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#1e293b' }}>
                            {assignment.title}
                          </span>
                          <span className={`badge badge-${assignment.status}`} style={{ fontSize: '0.65rem' }}>
                            {assignment.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                          <span>Due: {format(new Date(assignment.dueDate), 'MMM dd')}</span>
                          <span>{assignment.actualHours}h / {assignment.estimatedHours}h</span>
                        </div>
                      </div>
                    ))}
                    
                    {memberAssignments.length > 3 && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>
                        +{memberAssignments.length - 3} more assignments
                      </p>
                    )}
                  </div>
                )}
              </div>

              {util.assignments.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.75rem' }}>
                    Time Distribution
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {util.assignments.map((assignmentTime: any) => {
                      const assignment = memberAssignments.find((a: any) => a.id === assignmentTime.assignmentId);
                      const percentage = (assignmentTime.hours / util.totalHours) * 100;
                      
                      return (
                        <div key={assignmentTime.assignmentId} style={{ fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#64748b' }}>
                              {assignment?.title || 'Unknown Assignment'}
                            </span>
                            <span style={{ color: '#1e293b', fontWeight: '500' }}>
                              {assignmentTime.hours}h ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '0.25rem', 
                            backgroundColor: '#f1f5f9', 
                            borderRadius: '0.125rem',
                            overflow: 'hidden'
                          }}>
                            <div 
                              style={{ 
                                width: `${percentage}%`,
                                height: '100%',
                                backgroundColor: member?.avatarColor || '#64748b',
                                borderRadius: '0.125rem'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {utilizationData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BarChart3 size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No utilization data</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Add team members and assignments to see utilization metrics
          </p>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          Weekly Overview
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
          Current week: {format(startOfWeek(new Date()), 'MMM dd')} - {format(addDays(startOfWeek(new Date()), 6), 'MMM dd, yyyy')}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem' }}>
              {utilizationData.filter((u: any) => u.utilizationPercentage <= 70).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Under-utilized</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.25rem' }}>
              {utilizationData.filter((u: any) => u.utilizationPercentage > 70 && u.utilizationPercentage <= 90).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Well-utilized</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444', marginBottom: '0.25rem' }}>
              {utilizationData.filter((u: any) => u.utilizationPercentage > 90).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Over-utilized</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Utilization; 