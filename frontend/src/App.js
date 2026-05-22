import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

import Login from './Login';
import Signup from './Signup';
import TaskList from './TaskList';
import Dashboard from './components/Dashboard';
import NewTask from './components/NewTask';
import UserProfile from './components/UserProfile';
import TaskDetail from './components/TaskDetail';
import KanbanBoard from './components/KanbanBoard';


function App() {
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
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe' }}>

        {/* SIDEBAR */}
        {isLoggedIn && (
          <aside style={sidebarStyle}>
            <div style={logoArea}>⚡ TaskPro</div>

            <div style={navGroup}>
              <SidebarLink to="/dashboard" icon="🏠" label="Dashboard" />
              <SidebarLink to="/tasks" icon="📋" label="My Tasks" />
              <SidebarLink to="/new-task" icon="➕" label="New Task" />
              <SidebarLink to="/profile" icon="👤" label="Profile" />
              <SidebarLink to="/kanban" icon="📊" label="Kanban Board" />

            </div>

            <button onClick={handleLogout} style={sidebarLogout}>
              🚪 Logout
            </button>
          </aside>
        )}

        {/* MAIN */}
        <main style={{ flex: 1 }}>

          {/* HEADER */}
          {isLoggedIn && (
            <header style={topHeaderStyle}>
              <div>Workspace / <b>Overview</b></div>

              <Link to="/profile" style={headerUserPart}>
                <div style={avatarSmall}>
                  {user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div>{user?.username}</div>
                  <div style={{ fontSize: 11 }}>{user?.role}</div>
                </div>
              </Link>
            </header>
          )}

          <div style={{ padding: '30px' }}>
            <Routes>

              {/* 🔴 AUTH FLOW FIXED */}
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

/* styles same as yours */
const sidebarStyle = { width: '260px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '30px 20px', height: '100vh' };
const logoArea = { fontSize: '22px', fontWeight: '800', marginBottom: '40px' };
const navGroup = { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 };
const sidebarLinkStyle = { display: 'flex', gap: '10px', padding: '12px', textDecoration: 'none', color: '#718096' };
const sidebarLogout = { marginTop: 'auto', padding: '10px', background: '#fff5f5', border: 'none' };
const topHeaderStyle = { height: '70px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px' };
const headerUserPart = { display: 'flex', gap: '10px', textDecoration: 'none', color: 'inherit' };
const avatarSmall = { width: 35, height: 35, background: '#4fd1c5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' };

const SidebarLink = ({ to, icon, label }) => (
  <Link to={to} style={sidebarLinkStyle}>
    <span>{icon}</span> {label}
  </Link>
);

export default App;