import React, { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { useAuth } from '../context/AuthContext';
import './Family.css';

export const Family = () => {
    const {
        family,
        familyMembers,
        familyInvitations,
        createFamily,
        inviteMember,
        acceptInvitation,
        declineInvitation,
        leaveFamily,
        removeMember,
        sentInvitations,
        cancelInvitation
    } = useContext(GlobalContext);
    const { currentUser } = useAuth();

    const [familyName, setFamilyName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [lastInvitedEmail, setLastInvitedEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateFamily = async (e) => {
        e.preventDefault();
        if (!familyName.trim()) return;

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            console.log('Creating family with name:', familyName);
            console.log('Current user:', currentUser);
            const result = await createFamily(familyName);
            console.log('Create family result:', result);
            if (result) {
                setSuccess('Family created successfully!');
                setFamilyName('');
            } else {
                setError('Failed to create family. You may not be logged in properly.');
            }
        } catch (err) {
            console.error('Create family error:', err);
            setError(err.message || 'Failed to create family. Please try again.');
        }
        setLoading(false);
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await inviteMember(inviteEmail);
            setLastInvitedEmail(inviteEmail);
            setSuccess(`Invitation created for ${inviteEmail}.`);
            setInviteEmail('');
        } catch (err) {
            setError(err.message || 'Failed to send invitation.');
            setLastInvitedEmail('');
        }
        setLoading(false);
    };

    const handleAccept = async (id) => {
        setLoading(true);
        try {
            await acceptInvitation(id);
            setSuccess('Invitation accepted!');
        } catch (err) {
            setError(err.message || 'Failed to accept invitation.');
        }
        setLoading(false);
    };

    const handleDecline = async (id) => {
        setLoading(true);
        try {
            await declineInvitation(id);
            setSuccess('Invitation declined.');
        } catch (err) {
            setError('Failed to decline invitation.');
        }
        setLoading(false);
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this family?')) return;
        setLoading(true);
        try {
            await leaveFamily();
        } catch (err) {
            setError('Failed to leave family.');
        }
        setLoading(false);
    };

    const handleRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) return;
        try {
            await removeMember(memberId);
        } catch (err) {
            setError('Failed to remove member.');
        }
    };

    // View for users NOT in a family
    if (!family) {
        return (
            <div className="family-page">
                <div className="settings-header glass-panel">
                    <h2>Family Sharing</h2>
                    <p className="settings-subtitle">Join forces with your family to track expenses together</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {/* Pending Invitations */}
                {familyInvitations.length > 0 && (
                    <div className="settings-section glass-panel">
                        <h3 className="section-title">📬 Pending Invitations</h3>
                        <div className="invitations-list">
                            {familyInvitations.map(invite => (
                                <div key={invite.id} className="invitation-card">
                                    <div className="invitation-info">
                                        <strong>{invite.familyName}</strong>
                                        <span>Invited by {invite.invitedByName}</span>
                                    </div>
                                    <div className="invitation-actions">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleAccept(invite.id)}
                                            disabled={loading}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDecline(invite.id)}
                                            disabled={loading}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Family */}
                <div className="settings-section glass-panel">
                    <h3 className="section-title">✨ Create a New Family</h3>
                    <p className="section-desc">Start a new family group and invite members.</p>

                    <form onSubmit={handleCreateFamily} className="create-family-form">
                        <input
                            type="text"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            placeholder="Enter Family Name (e.g. The Smiths)"
                            className="form-input"
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !familyName.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Family'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // View for users IN a family
    const isAdmin = family.members[currentUser.uid]?.role === 'admin';

    return (
        <div className="family-page">
            <div className="settings-header glass-panel">
                <h2>{family.familyName}</h2>
                <p className="settings-subtitle">Family Settings & Members</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}

            {/* Invite Members */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">👋 Invite Member</h3>
                <form onSubmit={handleInvite} className="invite-form">
                    <div className="input-group">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="form-input"
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-secondary btn-auto"
                            disabled={loading || !inviteEmail.trim()}
                        >
                            Invite
                        </button>
                    </div>
                    <p className="helper-text">User must have an ExpenseFlow account with this email.</p>
                </form>

                {/* Sent Invitations List */}
                {sentInvitations && sentInvitations.length > 0 && (
                    <div className="sent-invitations" style={{ marginTop: '20px', borderTop: '1px solid var(--surface-border)', paddingTop: '15px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Pending Sent Invitations</h4>
                        <div className="invitations-list">
                            {sentInvitations.map(invite => (
                                <div key={invite.id} className="invitation-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px' }}>
                                    <div className="invitation-info">
                                        <div style={{ fontWeight: 'bold' }}>{invite.invitedEmail}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Sent: {new Date(invite.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        className="btn-icon-danger"
                                        onClick={async () => {
                                            if (window.confirm(`Cancel invitation to ${invite.invitedEmail}?`)) {
                                                try {
                                                    await cancelInvitation(invite.id);
                                                    setSuccess('Invitation cancelled.');
                                                } catch (err) {
                                                    setError('Failed to cancel invitation.');
                                                }
                                            }
                                        }}
                                        title="Cancel Invitation"
                                        style={{ padding: '5px 10px', fontSize: '0.9rem' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Member List */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">👥 Family Members ({familyMembers.length})</h3>
                <div className="members-list">
                    {familyMembers.map(member => (
                        <div key={member.uid || member.email} className="member-item">
                            <div className="member-info">
                                <div className="member-avatar">
                                    {member.name ? member.name[0].toUpperCase() : '?'}
                                </div>
                                <div className="member-details">
                                    <span className="member-name">
                                        {member.name}
                                        {member.email === currentUser.email && ' (You)'}
                                    </span>
                                    <span className="member-role">{member.role}</span>
                                </div>
                            </div>
                            {isAdmin && member.email !== currentUser.email && (
                                <button
                                    className="btn-icon-danger"
                                    onClick={() => handleRemoveMember(member.uid, member.name)}
                                    title="Remove Member"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="settings-section glass-panel danger-zone">
                <h3 className="section-title">⚠️ Danger Zone</h3>
                <div className="danger-actions">
                    <button
                        className="btn btn-danger"
                        onClick={handleLeave}
                        disabled={loading}
                    >
                        Leave Family
                    </button>
                </div>
            </div>
        </div>
    );
};
