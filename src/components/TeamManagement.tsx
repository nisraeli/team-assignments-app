import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TeamMember, Team } from '../types';
import { Plus, Edit, Trash2, Mail, User, Crown, UserPlus } from 'lucide-react';

function TeamManagement() {
  const { teamMembers, teams, addTeamMember, updateTeamMember, deleteTeamMember, getTeamMembers } = useData();
  const { sendInvitation, currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    capacity: 40,
    skills: '',
    teamId: '',
    isTeamLead: false
  });
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData = {
      ...formData,
      skills: formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      teamId: formData.teamId || undefined
    };

    if (editingMember) {
      updateTeamMember(editingMember.id, memberData);
      
      // Update team lead if needed
      if (formData.isTeamLead && formData.teamId) {
        const team = teams.find((t: Team) => t.id === formData.teamId);
        if (team && team.teamLeadId !== editingMember.id) {
          // Remove previous team lead status
          const previousLead = teamMembers.find((m: TeamMember) => m.id === team.teamLeadId);
          if (previousLead) {
            updateTeamMember(previousLead.id, { isTeamLead: false });
          }
        }
      }
    } else {
      addTeamMember(memberData);
    }

    setShowModal(false);
    setEditingMember(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      capacity: 40,
      skills: '',
      teamId: '',
      isTeamLead: false
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
      skills: member.skills.join(', '),
      teamId: member.teamId || '',
      isTeamLead: member.isTeamLead
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member? This will remove all their project allocations.')) {
      deleteTeamMember(id);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    sendInvitation(inviteEmail);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    resetForm();
  };

  const isAdmin = currentUser?.email === 'admin@company.com';

  return (
    <div>
      <div className="header">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Team Management
            </h1>
            <p style={{ color: '#64748b' }}>
              Manage team members, roles, and permissions
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isAdmin && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus size={16} />
                Send Invitation
              </button>
            )}
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} />
              Add Member
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        {teamMembers.map((member: TeamMember) => {
          const memberTeam = teams.find((t: Team) => t.id === member.teamId);
          
          return (
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
                  {member.isTeamLead && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <Crown size={14} style={{ color: '#eab308' }} />
                      <span style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: '500' }}>
                        Team Lead
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Mail size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{member.email}</span>
                </div>
                
                {memberTeam && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div 
                      style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '0.25rem', 
                        backgroundColor: memberTeam.color 
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{memberTeam.name}</span>
                  </div>
                )}
                
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
                {isAdmin && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {teamMembers.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <User size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No team members yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Start by adding team members to manage projects and allocations
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

      {/* Add/Edit Member Modal */}
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
                  placeholder="e.g., Senior Developer, UX Designer"
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
                  placeholder="e.g., Engineering, Design, Product"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team</label>
                <select
                  className="form-select"
                  value={formData.teamId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setFormData({ ...formData, teamId: e.target.value, isTeamLead: false })}
                >
                  <option value="">No team assigned</option>
                  {teams.map((team: Team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.teamId && (
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="isTeamLead"
                      checked={formData.isTeamLead}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData({ ...formData, isTeamLead: e.target.checked })}
                    />
                    <label htmlFor="isTeamLead" className="form-label" style={{ margin: 0 }}>
                      <Crown size={16} style={{ color: '#eab308', marginRight: '0.5rem' }} />
                      Team Lead
                    </label>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    This person will be the team lead and can manage team members and projects
                  </p>
                </div>
              )}

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

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Send Invitation</h2>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={inviteEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                  required
                  placeholder="colleague@company.com"
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  The person will receive an invitation to create an account
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamManagement; 