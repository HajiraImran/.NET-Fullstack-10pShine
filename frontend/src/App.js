import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

import Login from './Login';
import Signup from './Signup';
import TaskList from './TaskList';
import Dashboard from './components/Dashboard';
import NewTask from './components/NewTask';
import UserProfile from './components/UserProfile';
import TaskDetail from './components/TaskDetail';
import KanbanBoard from './components/KanbanBoard';
import EditTask from './components/EditTask'; 

function App() {
  // =========================================================
  // ⚡ AUTO-LOGOUT ON PROJECT RESTART / COLD START
  // =========================================================
  useEffect(() => {
    // Jab bhi project dobara run hoga ya tab pehli baar khulega,
    // yeh code sabse pehle chalega aur galti se login reh jane wale user ko saaf kar dega.
    localStorage.clear(); 
    setIsLoggedIn(false);
  }, []); // [] ka matlab hai yeh sirf app start hote waqt ek baar chalega

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getUserData = () => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  const user = getUserData();
  const isAdmin = user?.role === 'Admin'; // Dynamic Role Check

  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
        
        {/* Real-World Premium Layout CSS Engine */}
        <style>{`
          .sidebar-link-node {
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .sidebar-link-node:hover {
            background: rgba(255, 255, 255, 0.04) !important;
            color: #f8fafc !important;
            transform: translateX(3px);
          }
          .logout-action-node {
            transition: all 0.2s ease !important;
          }
          .logout-action-node:hover {
            background: rgba(239, 68, 68, 0.1) !important;
            color: #ef4444 !important;
            border-color: rgba(239, 68, 68, 0.2) !important;
          }
          .header-avatar-node {
            transition: transform 0.2s ease !important;
          }
          .header-avatar-node:hover {
            transform: scale(1.05);
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #090d16;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `}</style>

        {/* ========================= */}
        {/* PREMIUM FIXED SIDEBAR */}
        {/* ========================= */}
        {isLoggedIn && (
          <aside style={sidebarStyle}>
            {/* Logo Area */}
            <div style={logoArea}>
              <div style={logoIcon}></div>
              <div>
                <span style={logoTextMain}>TaskPro</span>
                <span style={logoVersion}>CORE v2.0</span>
              </div>
            </div>

            {/* Navigation Section */}
            <div style={navGroup}>
              <p style={sectionLabel}>Navigation</p>
              <SidebarLink to="/dashboard" label="Dashboard" />
              
              {/* DYNAMIC LABEL CONDITION: Admin ke liye All Tasks, User ke liye My Tasks */}
              <SidebarLink to="/tasks" label={isAdmin ? "All Tasks" : "My Tasks"} />
              
              <SidebarLink to="/new-task" label="New Task" />
              <SidebarLink to="/kanban" label="Kanban Board" />
              <SidebarLink to="/profile" label="Profile" />
            </div>

            {/* Session Management */}
            <button onClick={handleLogout} style={sidebarLogout} className="logout-action-node">
              Terminate Session
            </button>
          </aside>
        )}

        {/* ========================= */}
        {/* MAIN STRUCTURAL CONTAINER */}
        {/* ========================= */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 0,
          marginLeft: isLoggedIn ? '260px' : '0px'
        }}>

          {/* PREMIUM TOP HEADER */}
          {isLoggedIn && (
            <header style={topHeaderStyle}>
              <div style={breadcrumbStyle}>Workspace <span style={{color: '#475569'}}>/</span> <b style={{color: '#f8fafc', fontWeight: '600'}}>Overview</b></div>

              <Link to="/profile" style={headerUserPart} className="header-avatar-node">
                <div style={avatarSmall}>
                  {user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={usernameStyle}>{user?.username}</div>
                  <div style={userRoleStyle}>{user?.role} Node</div>
                </div>
              </Link>
            </header>
          )}

          {/* DYNAMIC VIEW ROUTER MOUNT */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: !isLoggedIn ? 'center' : 'flex-start', 
            alignItems: !isLoggedIn ? 'center' : 'flex-start',
            padding: !isLoggedIn ? '0' : '40px 50px',
            background: '#090d16'
          }}>
            <Routes>
              {/* AUTH FLOW */}
              {!isLoggedIn ? (
                <>
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="*" element={<Navigate to="/login" />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<TaskList />} />
                  <Route path="/new-task" element={<NewTask />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/task/:id" element={<TaskDetail />} />
                  <Route path="/kanban" element={<KanbanBoard />} />
                  <Route path="/edit-task/:id" element={<EditTask />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
              )}
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// =========================
// SIDEBAR LINK COMPONENT WITH ACTIVE ROUTE TRACKING
// =========================
const SidebarLink = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} style={active ? sidebarActiveLinkStyle : sidebarLinkStyle} className={!active ? "sidebar-link-node" : ""}>
      <span style={{
        width: '6px', 
        height: '6px', 
        borderRadius: '50%', 
        background: active ? '#6366f1' : '#475569',
        boxShadow: active ? '0 0 8px #6366f1' : 'none',
        transition: 'all 0.2s ease'
      }}></span>
      {label}
    </Link>
  );
};

// =========================
// ULTRA LUXURY STYLING BLOCKS
// =========================
const sidebarStyle = { 
  width: '260px', 
  backgroundColor: '#090d16', 
  borderRight: '1px solid rgba(255, 255, 255, 0.05)', 
  display: 'flex', 
  flexDirection: 'column', 
  padding: '35px 24px', 
  height: '100vh',
  boxSizing: 'border-box',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000
};

const logoArea = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '45px', paddingLeft: '4px' };
const logoIcon = { width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)', boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)' };
const logoTextMain = { fontSize: '17px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.4px', display: 'block' };
const logoVersion = { fontSize: '9px', color: '#475569', fontWeight: '700', letterSpacing: '0.6px', display: 'block', marginTop: '1px' };

const navGroup = { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 };
const sectionLabel = { margin: '0 0 12px 6px', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' };

const sidebarLinkStyle = { 
  display: 'flex', 
  alignItems: 'center',
  gap: '12px', 
  padding: '10px 14px', 
  borderRadius: '8px',
  textDecoration: 'none', 
  color: '#94a3b8',
  fontSize: '14px',
  fontWeight: '500'
};

const sidebarActiveLinkStyle = {
  ...sidebarLinkStyle,
  color: '#f8fafc',
  background: 'rgba(99, 102, 241, 0.08)',
  border: '1px solid rgba(99, 102, 241, 0.15)',
  fontWeight: '600'
};

const sidebarLogout = { 
  marginTop: 'auto', 
  padding: '11px', 
  background: 'transparent', 
  border: '1px solid rgba(255, 255, 255, 0.05)', 
  borderRadius: '8px',
  color: '#64748b',
  fontWeight: '600',
  fontSize: '13px',
  cursor: 'pointer'
};

const topHeaderStyle = { 
  height: '75px', 
  background: '#090d16', 
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '0 50px',
  boxSizing: 'border-box'
};

const breadcrumbStyle = { fontSize: '13px', color: '#64748b', letterSpacing: '-0.1px' };
const headerUserPart = { display: 'flex', gap: '12px', textDecoration: 'none', color: 'inherit', cursor: 'pointer' };

const avatarSmall = { 
  width: '34px', 
  height: '34px', 
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  color: '#fff',
  borderRadius: '50%',
  fontSize: '13px',
  fontWeight: '700',
  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
};

const usernameStyle = { color: '#f8fafc', fontSize: '13px', fontWeight: '600' };
const userRoleStyle = { color: '#64748b', fontSize: '11px', fontWeight: '500', marginTop: '1px' };

export default App;