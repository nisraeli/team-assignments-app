import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ProjectAllocation, TeamMember, Team } from '../types';
import { Plus, Edit, Trash2, Calendar, Clock, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

function ProjectAllocations() {
  const { projectAllocations, teamMembers, teams, addProjectAllocation, updateProjectAllocation, deleteProjectAllocation } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<ProjectAllocation | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teamId: '',
    assigneeId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'planning' as 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold',
    estimatedHours: 40,
    actualHours: 0,
    startDate: '',
    endDate: '',
    tags: '',
    projectCode: '',
    budget: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allocationData = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
    };

    if (editingAllocation) {
      updateProjectAllocation(editingAllocation.id, allocationData);
    } else {
      addProjectAllocation(allocationData);
    }

    setShowModal(false);
    setEditingAllocation(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      teamId: '',
      assigneeId: '',
      priority: 'medium',
      status: 'planning',
      estimatedHours: 40,
      actualHours: 0,
      startDate: '',
      endDate: '',
      tags: '',
      projectCode: '',
      budget: 0
    });
  };

  const handleEdit = (allocation: ProjectAllocation) => {
    setEditingAllocation(allocation);
    setFormData({
      title: allocation.title,
      description: allocation.description,
      teamId: allocation.teamId,
      assigneeId: allocation.assigneeId,
      priority: allocation.priority,
      status: allocation.status,
      estimatedHours: allocation.estimatedHours,
      actualHours: allocation.actualHours,
      startDate: format(new Date(allocation.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(allocation.endDate), 'yyyy-MM-dd'),
      tags: allocation.tags.join(', '),
      projectCode: allocation.projectCode || '',
      budget: allocation.budget || 0
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project allocation?')) {
      deleteProjectAllocation(id);
    }
  };

  const handleStatusChange = (allocationId: string, newStatus: ProjectAllocation['status']) => {
    updateProjectAllocation(allocationId, { status: newStatus });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAllocation(null);
    resetForm();
  };

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

  const isOverdue = (endDate: Date) => {
    return new Date() > new Date(endDate);
  };

  const getTeamMembers = (teamId: string) => {
    return teamMembers.filter((member: TeamMember) => member.teamId === teamId);
  };

  return (
    <div>
      <div className="header">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Project Allocations
            </h1>
            <p style={{ color: '#64748b' }}>
              Manage and track project allocations across teams
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            New Allocation
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        {projectAllocations.map((allocation: ProjectAllocation) => {
          const assignee = teamMembers.find((m: TeamMember) => m.id === allocation.assigneeId);
          const team = teams.find((t: Team) => t.id === allocation.teamId);
          const overdue = isOverdue(allocation.endDate);
          
          return (
            <div key={allocation.id} className="assignment-card">
              <div className="assignment-header">
                <div>
                  <h3 className="assignment-title">{allocation.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${getStatusBadgeClass(allocation.status)}`}>
                      {allocation.status}
                    </span>
                    <span className={`badge ${getPriorityBadgeClass(allocation.priority)}`}>
                      {allocation.priority}
                    </span>
                    {overdue && allocation.status !== 'completed' && (
                      <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        Overdue
                      </span>
                    )}
                    {allocation.projectCode && (
                      <span className="badge" style={{ backgroundColor: '#f0f9ff', color: '#1d4ed8' }}>
                        {allocation.projectCode}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(allocation)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(allocation.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="assignment-description">{allocation.description}</p>

              <div style={{ marginBottom: '1rem' }}>
                {team && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div 
                      style={{ 
                        width: '1rem', 
                        height: '1rem', 
                        borderRadius: '0.25rem', 
                        backgroundColor: team.color 
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                      {team.name}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div 
                    className="avatar avatar-sm"
                    style={{ backgroundColor: assignee?.avatarColor || '#64748b' }}
                  >
                    {assignee?.name.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>
                    {assignee?.name || 'Unassigned'}
                  </span>
                  {assignee?.isTeamLead && (
                    <span style={{ fontSize: '0.75rem', color: '#eab308' }}>• Lead</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Calendar size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '0.875rem', color: overdue ? '#ef4444' : '#64748b' }}>
                    {format(new Date(allocation.startDate), 'MMM dd')} - {format(new Date(allocation.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {allocation.actualHours}h / {allocation.estimatedHours}h
                  </span>
                  <div style={{ 
                    flex: 1, 
                    height: '0.25rem', 
                    backgroundColor: '#f1f5f9', 
                    borderRadius: '0.125rem',
                    marginLeft: '0.5rem'
                  }}>
                    <div 
                      style={{ 
                        width: `${Math.min((allocation.actualHours / allocation.estimatedHours) * 100, 100)}%`,
                        height: '100%',
                        backgroundColor: allocation.actualHours > allocation.estimatedHours ? '#ef4444' : '#10b981',
                        borderRadius: '0.125rem'
                      }}
                    />
                  </div>
                </div>

                {allocation.budget && allocation.budget > 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    Budget: ${allocation.budget.toLocaleString()}
                  </p>
                )}

                {allocation.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {allocation.tags.map((tag: string, index: number) => (
                      <span key={index} className="skill-tag" style={{ fontSize: '0.7rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                  Status:
                </label>
                <select
                  className="form-select"
                  value={allocation.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    handleStatusChange(allocation.id, e.target.value as ProjectAllocation['status'])}
                  style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {projectAllocations.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Briefcase size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No project allocations yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Create your first project allocation to get started
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Create Allocation
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingAllocation ? 'Edit Project Allocation' : 'New Project Allocation'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., E-commerce Platform Redesign"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Detailed description of the project allocation"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team</label>
                <select
                  className="form-select"
                  value={formData.teamId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFormData({ ...formData, teamId: e.target.value, assigneeId: '' });
                  }}
                  required
                >
                  <option value="">Select team</option>
                  {teams.map((team: Team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select
                  className="form-select"
                  value={formData.assigneeId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setFormData({ ...formData, assigneeId: e.target.value })}
                  required
                  disabled={!formData.teamId}
                >
                  <option value="">Select team member</option>
                  {formData.teamId && getTeamMembers(formData.teamId).map((member: TeamMember) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role} {member.isTeamLead ? '(Lead)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Estimated Hours</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    step="1"
                    value={formData.estimatedHours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Actual Hours</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="0.5"
                    value={formData.actualHours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, actualHours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Project Code (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.projectCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, projectCode: e.target.value })}
                    placeholder="e.g., PROJ-001"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Budget (optional)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={formData.budget}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Frontend, Backend, Design"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAllocation ? 'Update' : 'Create'} Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectAllocations; 