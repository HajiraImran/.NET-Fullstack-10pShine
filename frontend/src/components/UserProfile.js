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

    return (
        <div style={profileContainer}>
            <div style={profileCard}>
                <div style={avatarLarge}>
                    {user.username?.charAt(0).toUpperCase()}
                </div>
                <h2 style={userName}>{user.username}</h2>
                <p style={userRole}>{user.role} Account</p>
                
                <div style={infoSection}>
                    <div style={infoRow}>
                        <span style={label}>User ID:</span>
                        <span style={value}># {user.id}</span>
                    </div>
                    <div style={infoRow}>
                        <span style={label}>Email:</span>
                        <span style={value}>{user.email || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Professional UI Styles ---
const profileContainer = { display: 'flex', justifyContent: 'center', marginTop: '50px' };
const profileCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', width: '100%', maxWidth: '400px' };
const avatarLarge = { width: '80px', height: '80px', backgroundColor: '#6c5ce7', color: 'white', borderRadius: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 'bold', margin: '0 auto 20px' };
const userName = { fontSize: '24px', margin: '10px 0 5px', color: '#2d3436' };
const userRole = { fontSize: '14px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px' };
const infoSection = { marginTop: '30px', borderTop: '1px solid #f1f2f6', paddingTop: '20px' };
const infoRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' };
const label = { color: '#718096', fontWeight: '500' };
const value = { color: '#2d3436', fontWeight: 'bold' };

// CRITICAL FIX: Yeh line hona zaroori hai!
export default UserProfile;