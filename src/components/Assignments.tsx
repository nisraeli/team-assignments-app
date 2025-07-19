import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Assignment } from '../types';
import { Plus, Edit, Trash2, Calendar, Clock, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

function Assignments() {
  const { assignments, teamMembers, addAssignment, updateAssignment, deleteAssignment } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in-progress' | 'review' | 'completed',
    estimatedHours: 8,
    actualHours: 0,
    dueDate: '',
    tags: '',
    project: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assignmentData = {
      ...formData,
      dueDate: new Date(formData.dueDate),
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
    };

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, assignmentData);
    } else {
      addAssignment(assignmentData);
    }

    setShowModal(false);
    setEditingAssignment(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assigneeId: '',
      priority: 'medium',
      status: 'todo',
      estimatedHours: 8,
      actualHours: 0,
      dueDate: '',
      tags: '',
      project: ''
    });
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      assigneeId: assignment.assigneeId,
      priority: assignment.priority,
      status: assignment.status,
      estimatedHours: assignment.estimatedHours,
      actualHours: assignment.actualHours,
      dueDate: format(new Date(assignment.dueDate), 'yyyy-MM-dd'),
      tags: assignment.tags.join(', '),
      project: assignment.project || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignment(id);
    }
  };

  const handleStatusChange = (assignmentId: string, newStatus: Assignment['status']) => {
    updateAssignment(assignmentId, { status: newStatus });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAssignment(null);
    resetForm();
  };

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

  const isOverdue = (dueDate: Date) => {
    return new Date() > new Date(dueDate);
  };

  return (
    <div>
      <div className="header">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Assignments
            </h1>
            <p style={{ color: '#64748b' }}>
              Manage and track team assignments
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            New Assignment
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        {assignments.map(assignment => {
          const assignee = teamMembers.find((m: any) => m.id === assignment.assigneeId);
          const overdue = isOverdue(assignment.dueDate);
          
          return (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-header">
                <div>
                  <h3 className="assignment-title">{assignment.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className={`badge ${getStatusBadgeClass(assignment.status)}`}>
                      {assignment.status}
                    </span>
                    <span className={`badge ${getPriorityBadgeClass(assignment.priority)}`}>
                      {assignment.priority}
                    </span>
                    {overdue && assignment.status !== 'completed' && (
                      <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(assignment)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(assignment.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="assignment-description">{assignment.description}</p>

              <div style={{ marginBottom: '1rem' }}>
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
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Calendar size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '0.875rem', color: overdue ? '#ef4444' : '#64748b' }}>
                    Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {assignment.actualHours}h / {assignment.estimatedHours}h
                  </span>
                </div>

                {assignment.project && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Project: {assignment.project}
                  </p>
                )}

                {assignment.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {assignment.tags.map((tag: string, index: number) => (
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
                  value={assignment.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    handleStatusChange(assignment.id, e.target.value as Assignment['status'])}
                  style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ClipboardList size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No assignments yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Create your first assignment to get started
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Create Assignment
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingAssignment ? 'Edit Assignment' : 'New Assignment'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, title: e.target.value })}
                  required
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
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select
                  className="form-select"
                  value={formData.assigneeId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setFormData({ ...formData, assigneeId: e.target.value })}
                  required
                >
                  <option value="">Select team member</option>
                  {teamMembers.map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
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
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Estimated Hours</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0.5"
                    step="0.5"
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

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.project}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, project: e.target.value })}
                  placeholder="Project name"
                />
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
                  {editingAssignment ? 'Update' : 'Create'} Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assignments; 