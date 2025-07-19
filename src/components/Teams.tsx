import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Team, TeamMember } from '../types';
import { Plus, Users, Crown, Edit, Trash2, User } from 'lucide-react';

function Teams() {
  const { teams, teamMembers, addTeam, updateTeam, deleteTeam, getTeamMembers, getTeamLead, getTeamAllocations } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamLeadId: '',
    color: '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const teamData = {
      ...formData,
      memberIds: editingTeam ? editingTeam.memberIds : []
    };

    if (editingTeam) {
      updateTeam(editingTeam.id, teamData);
    } else {
      addTeam(teamData);
    }

    setShowModal(false);
    setEditingTeam(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      teamLeadId: '',
      color: '#3B82F6'
    });
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      teamLeadId: team.teamLeadId,
      color: team.color
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team? This will remove all project allocations for this team.')) {
      deleteTeam(id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    resetForm();
  };

  const availableLeads = teamMembers.filter((member: TeamMember) => 
    !editingTeam || member.teamId === editingTeam.id || !member.teamId
  );

  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div>
      <div className="header">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Teams
            </h1>
            <p style={{ color: '#64748b' }}>
              Manage your teams and team leads
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            New Team
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        {teams.map((team: Team) => {
          const teamLead = getTeamLead(team.id);
          const members = getTeamMembers(team.id);
          const allocations = getTeamAllocations(team.id);
          
          return (
            <div key={team.id} className="card">
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div 
                      style={{ 
                        width: '3rem', 
                        height: '3rem', 
                        borderRadius: '0.75rem', 
                        backgroundColor: team.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.25rem',
                        fontWeight: '700'
                      }}
                    >
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                        {team.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {team.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(team)}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(team.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {teamLead && (
                  <div style={{ 
                    padding: '1rem', 
                    backgroundColor: '#fefce8', 
                    border: '1px solid #fde047',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Crown size={18} style={{ color: '#eab308' }} />
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#a16207' }}>
                          Team Lead
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#a16207' }}>
                          {teamLead.name} • {teamLead.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} />
                    Team Members ({members.length})
                  </h4>
                  
                  {members.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
                      No team members assigned
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {members.slice(0, 4).map((member: TeamMember) => (
                        <div 
                          key={member.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            padding: '0.5rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '0.375rem'
                          }}
                        >
                          <div 
                            className="avatar avatar-sm"
                            style={{ backgroundColor: member.avatarColor }}
                          >
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                              {member.name}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {member.role}
                            </p>
                          </div>
                          {member.isTeamLead && (
                            <Crown size={14} style={{ color: '#eab308' }} />
                          )}
                        </div>
                      ))}
                      
                      {members.length > 4 && (
                        <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>
                          +{members.length - 4} more members
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                      {allocations.length}
                    </div>
                    <div style={{ color: '#64748b' }}>Active Projects</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                      {members.reduce((total: number, member: TeamMember) => total + member.capacity, 0)}h
                    </div>
                    <div style={{ color: '#64748b' }}>Total Capacity</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {teams.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No teams yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Create your first team to get started with project allocations
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Create First Team
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTeam ? 'Edit Team' : 'New Team'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Frontend Development"
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
                  placeholder="Brief description of the team's responsibilities"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Lead</label>
                <select
                  className="form-select"
                  value={formData.teamLeadId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setFormData({ ...formData, teamLeadId: e.target.value })}
                  required
                >
                  <option value="">Select team lead</option>
                  {availableLeads.map((member: TeamMember) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Team Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: color,
                        border: formData.color === color ? '3px solid #1e293b' : '2px solid #e2e8f0',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTeam ? 'Update' : 'Create'} Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams; 