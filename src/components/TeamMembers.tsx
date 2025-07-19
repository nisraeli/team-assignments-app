import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { TeamMember } from '../types';
import { Plus, Edit, Trash2, Mail, User, Users } from 'lucide-react';

function TeamMembers() {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    capacity: 40,
    skills: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData = {
      ...formData,
      skills: formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
    };

    if (editingMember) {
      updateTeamMember(editingMember.id, memberData);
    } else {
      addTeamMember(memberData);
    }

    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      capacity: 40,
      skills: ''
    });
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      capacity: member.capacity,
      skills: member.skills.join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      deleteTeamMember(id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      capacity: 40,
      skills: ''
    });
  };

  return (
    <div>
      <div className="header">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Team Members
            </h1>
            <p style={{ color: '#64748b' }}>
              Manage your team members and their information
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Add Member
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        {teamMembers.map(member => (
          <div key={member.id} className="team-member-card">
            <div className="team-member-header">
              <div 
                className="avatar"
                style={{ backgroundColor: member.avatarColor }}
              >
                {member.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="team-member-info">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Mail size={14} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{member.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <User size={14} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{member.department}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Capacity: {member.capacity}h/week
              </p>
            </div>

            <div className="skills-list">
              {member.skills.map((skill: string, index: number) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleEdit(member)}
              >
                <Edit size={14} />
                Edit
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(member.id)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No team members yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Get started by adding your first team member
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Add First Member
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.department}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weekly Capacity (hours)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="80"
                  value={formData.capacity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.skills}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMember ? 'Update' : 'Add'} Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamMembers; 