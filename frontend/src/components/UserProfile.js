import React from 'react';
import { Navigate } from 'react-router-dom';

const UserProfile = () => {
    // 1. Safe User Fetching (Crash se bachne ke liye)
    const storedUser = localStorage.getItem('user');
    const user = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

    // 2. Auth Protection: Agar user login nahi hai toh login page par bhejo
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isAdmin = user?.role === "Admin";

    return (
        <div style={profileContainer}>
            
            {/* Embedded Micro-Interactions Layer */}
            <style>{`
                @keyframes cardEntrance {
                    from { transform: translateY(15px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .profile-animate {
                    animation: cardEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .meta-label-tag {
                    color: #475569;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .meta-value-tag {
                    color: #f1f5f9;
                    font-size: 14px;
                    font-weight: 600;
                }
            `}</style>

            <div 
                style={{ 
                    ...profileCard, 
                    borderTop: isAdmin ? '4px solid #6366f1' : '4px solid #475569',
                    boxShadow: isAdmin ? '0 25px 50px -12px rgba(99, 102, 241, 0.12)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }} 
                className="profile-animate"
            >
                {/* LARGE IDENTITY NODE */}
                <div style={{ ...avatarLarge, boxShadow: isAdmin ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none' }}>
                    {user.username?.charAt(0).toUpperCase()}
                </div>
                
                <h2 style={userName}>{user.username}</h2>
                
                <div style={badgeWrapper}>
                    <span style={isAdmin ? adminBadge : userBadge}>
                        {user.role || 'Standard'} Account
                    </span>
                </div>
                
                {/* ACCOUNT ATTRIBUTES METADATA BLOCK */}
                <div style={infoSection}>
                    <div style={infoRow}>
                        <span className="meta-label-tag">User Identifier</span>
                        <span className="meta-value-tag" style={{ color: '#6366f1' }}>#{user.id}</span>
                    </div>
                    
                    <div style={infoRow}>
                        <span className="meta-label-tag">Communication Node</span>
                        <span className="meta-value-tag">{user.email || 'N/A'}</span>
                    </div>

                    <div style={infoRow}>
                        <span className="meta-label-tag">System Access Scope</span>
                        <span className="meta-value-tag" style={{ fontSize: '13px', color: isAdmin ? '#a5b4fc' : '#94a3b8' }}>
                            {isAdmin ? 'Global Read/Write/Delete' : 'Restricted Sandbox'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================
// PREMIUM MATTE DARK STYLES MAP
// =========================
const profileContainer = { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    minHeight: '80vh',
    padding: '20px',
    boxSizing: 'border-box'
};

const profileCard = { 
    backgroundColor: '#0f172a', 
    padding: '40px 35px', 
    borderRadius: '16px', 
    border: '1px solid rgba(255, 255, 255, 0.04)',
    textAlign: 'center', 
    width: '100%', 
    maxWidth: '420px',
    boxSizing: 'border-box'
};

const avatarLarge = { 
    width: '85px', 
    height: '85px', 
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
    color: '#ffffff', 
    borderRadius: '24px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    fontSize: '36px', 
    fontWeight: '700', 
    margin: '0 auto 20px',
    letterSpacing: '-1px'
};

const userName = { 
    fontSize: '22px', 
    fontWeight: '700',
    margin: '0 0 8px 0', 
    color: '#f8fafc',
    letterSpacing: '-0.5px'
};

const badgeWrapper = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
};

const adminBadge = { 
    background: 'rgba(99, 102, 241, 0.1)', 
    color: '#a5b4fc', 
    fontSize: '11px', 
    padding: '4px 12px', 
    borderRadius: '6px', 
    border: '1px solid rgba(99, 102, 241, 0.2)', 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const userBadge = { 
    background: 'rgba(255, 255, 255, 0.04)', 
    color: '#94a3b8', 
    fontSize: '11px', 
    padding: '4px 12px', 
    borderRadius: '6px', 
    border: '1px solid rgba(255, 255, 255, 0.04)', 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const infoSection = { 
    backgroundColor: '#090d16',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
};

const infoRow = { 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    paddingBottom: '12px'
};

// Removing double padding boundary on the last item explicitly
infoRow[':last-child'] = {
    borderBottom: 'none',
    paddingBottom: '0'
};

export default UserProfile;