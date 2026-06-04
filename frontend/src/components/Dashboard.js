import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {

    // =========================
    // STATES
    // =========================
    const [stats, setStats] = useState({
        pending: 0,
        inProgress: 0,
        completed: 0,
        total: 0
    });

    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // =========================
    // SAFE USER PARSE
    // =========================
    const storedUser = localStorage.getItem('user');
    const user =
        storedUser && storedUser !== "undefined"
            ? JSON.parse(storedUser)
            : null;

    // =========================
    // FETCH DATA
    // =========================
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            // FETCH STATS
            const statsRes = await axios.get(
                'http://localhost:5006/api/tasks/stats',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setStats(statsRes.data);

            // FETCH TASKS
            const tasksRes = await axios.get(
                'http://localhost:5006/api/tasks',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setRecentTasks(tasksRes.data);

        } catch (err) {
            console.error("Dashboard error:", err.response?.data || err.message);
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={loadingWrapper}>
                <div style={spinnerStyle}></div>
                <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', letterSpacing: '0.5px' }}>
                    INITIALIZING SECURE SESSION...
                </div>
            </div>
        );
    }

    if (!user) return null;

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const isAdmin = user.role === 'Admin';

    return (
        <div style={wrapper}>
            
            {/* Real-World Premium CSS Engine */}
            <style>{`
                @keyframes pageEntrance {
                    from { transform: translateY(15px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .saas-animate {
                    animation: pageEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .saas-card {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
                .saas-card:hover {
                    transform: translateY(-4px) !important;
                    border-color: rgba(99, 102, 241, 0.4) !important;
                    box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.05) !important;
                }
                .saas-task-row {
                    transition: all 0.25s ease !important;
                }
                .saas-task-row:hover {
                    border-color: rgba(255, 255, 255, 0.15) !important;
                    background: linear-gradient(90deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%) !important;
                    transform: translateX(4px);
                }
                .glow-action-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
                    transition: all 0.25s ease !important;
                }
                .glow-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4) !important;
                    filter: brightness(1.1);
                }
            `}</style>

            {/* ========================= */}
            {/* PREMIUM GLASS-TOP HEADER */}
            {/* ========================= */}
            <div style={headerSection} className="saas-animate">
                <div>
                    <h1 style={title}>Welcome, <span style={gradientText}>{user.username}</span></h1>
                    <div style={metaFlex}>
                        <span style={roleBadge}>{user.role} Dashboard</span>
                        <span style={divider}>|</span>
                        <span style={completionText}>
                            System Productivity: <strong style={{color: '#6366f1'}}>{completionRate}% Completed</strong>
                        </span>
                    </div>
                </div>

                {isAdmin && (
                    <Link to="/new-task" style={createBtn} className="glow-action-btn">
                        + Create New Task
                    </Link>
                )}
            </div>

            {/* ========================= */}
            {/* SAAS TECH METRICS GRID */}
            {/* ========================= */}
            <div style={grid} className="saas-animate">
                {/* TOTAL */}
                <div style={{...box, borderTop: '2px solid #6366f1'}} className="saas-card">
                    <p style={boxLabel}>Total Tasks</p>
                    <h2 style={{...boxNumber, color: '#f8fafc'}}>{stats.total}</h2>
                    <div style={miniProgressBg}><div style={{...miniProgressBar, width: '100%', background: '#6366f1'}}></div></div>
                </div>
                
                {/* PENDING */}
                <div style={{...box, borderTop: '2px solid #f59e0b'}} className="saas-card">
                    <p style={boxLabel}>Pending Tasks Count</p>
                    <h2 style={{...boxNumber, color: '#f59e0b'}}>{stats.pending}</h2>
                    <div style={miniProgressBg}><div style={{...miniProgressBar, width: `${(stats.pending/stats.total)*100 || 0}%`, background: '#f59e0b'}}></div></div>
                </div>

                {/* IN PROGRESS */}
                <div style={{...box, borderTop: '2px solid #3b82f6'}} className="saas-card">
                    <p style={boxLabel}>In Progress Tasks Count</p>
                    <h2 style={{...boxNumber, color: '#3b82f6'}}>{stats.inProgress}</h2>
                    <div style={miniProgressBg}><div style={{...miniProgressBar, width: `${(stats.inProgress/stats.total)*100 || 0}%`, background: '#3b82f6'}}></div></div>
                </div>

                {/* COMPLETED */}
                <div style={{...box, borderTop: '2px solid #10b981'}} className="saas-card">
                    <p style={boxLabel}>Completed Tasks Count</p>
                    <h2 style={{...boxNumber, color: '#10b981'}}>{stats.completed}</h2>
                    <div style={miniProgressBg}><div style={{...miniProgressBar, width: `${completionRate}%`, background: '#10b981'}}></div></div>
                </div>
            </div>

            {/* ========================= */}
            {/* STREAMLINED RECENT TASKS */}
            {/* ========================= */}
            <div style={taskSection} className="saas-animate">
                <div style={sectionHeaderFlex}>
                    <h2 style={taskHeading}>Active Project Clusters</h2>
                    <span style={counterBadge}>{recentTasks.length} Live Node(s)</span>
                </div>

                {recentTasks.length > 0 ? (
                    <div style={tasksContainerGrid}>
                        {recentTasks.map(task => (
                            <div key={task.id} style={taskCard} className="saas-task-row">
                                <div style={taskTop}>
                                    <h3 style={taskTitleText}>{task.title}</h3>
                                    <span style={statusBadge(task.status)}>
                                        {task.status === 'InProgress' ? 'In Progress' : task.status}
                                    </span>
                                </div>

                                <p style={taskDesc}>
                                    {task.description || "No core execution details specified for this workspace instance."}
                                </p>

                                <div style={taskBottom}>
                                    <div style={metaItem}>
                                        <span style={metaLabel}>Deadline</span> 
                                        <span style={metaValue}>{new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</span>
                                    </div>
                                    <div style={metaItem}>
                                        <span style={metaLabel}>Severity</span> 
                                        <span style={priorityColorStyle(task.priority)}>{task.priority}</span>
                                    </div>
                                    <div style={metaItem}>
                                        <span style={metaLabel}>Owner</span> 
                                        <span style={{...metaValue, color: '#6366f1'}}>{task.assignedTo || 'Unassigned'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={emptyStateCard}>
                        <h4 style={{margin: '0 0 6px 0', color: '#f8fafc', fontWeight: '600'}}>Workspace is operational</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>No active background processes queued.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

// =========================
// HIGH-END CYBERPUNK/SAAS STYLES
// =========================
const wrapper = {
    padding: '40px 50px',
    background: '#090d16', // Dark High-end Tech Black
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Roboto, Helvetica, sans-serif'
};

const loadingWrapper = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090d16', gap: '15px' };
const spinnerStyle = { width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' };

const headerSection = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.2) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '24px 32px',
    borderRadius: '16px'
};

const title = { margin: 0, fontSize: '26px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.5px' };
const gradientText = {
    background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '800'
};

const metaFlex = { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '13px', color: '#64748b' };
const roleBadge = { color: '#f8fafc', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' };
const divider = { color: 'rgba(255,255,255,0.1)' };
const completionText = { color: '#94a3b8' };

const createBtn = {
    color: '#fff',
    padding: '11px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '13px',
    letterSpacing: '0.3px'
};

const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '45px'
};

const box = { 
    background: '#0f172a', // Matte Dark Slate Card
    padding: '26px 24px', 
    borderRadius: '14px', 
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
};

const boxLabel = { margin: '0 0 8px 0', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };
const boxNumber = { margin: 0, fontSize: '36px', fontWeight: '700', letterSpacing: '-1px' };
const miniProgressBg = { width: '100%', height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', marginTop: '14px', overflow: 'hidden' };
const miniProgressBar = { height: '100%', transition: 'width 0.5s ease' };

const taskSection = { marginTop: '10px' };
const sectionHeaderFlex = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' };
const taskHeading = { margin: 0, fontSize: '18px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px' };
const counterBadge = { background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '600' };

const tasksContainerGrid = { display: 'flex', flexDirection: 'column', gap: '14px' };

const taskCard = { 
    background: 'linear-gradient(180deg, #0f172a 0%, rgba(15, 23, 42, 0.8) 100%)', 
    padding: '24px', 
    borderRadius: '14px', 
    border: '1px solid rgba(255, 255, 255, 0.04)'
};

const taskTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' };
const taskTitleText = { margin: 0, fontSize: '16px', fontWeight: '600', color: '#f8fafc' };
const taskDesc = { color: '#94a3b8', marginTop: '8px', fontSize: '14px', lineHeight: '1.6', marginBottom: 0 };

const taskBottom = { 
    display: 'flex', 
    alignItems: 'center', 
    marginTop: '20px', 
    fontSize: '13px', 
    flexWrap: 'wrap', 
    gap: '35px', 
    paddingTop: '16px', 
    borderTop: '1px solid rgba(255, 255, 255, 0.04)' 
};

const metaItem = { display: 'flex', flexDirection: 'column', gap: '4px' };
const metaLabel = { color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const metaValue = { color: '#cbd5e1', fontWeight: '500' };

const priorityColorStyle = (priority) => {
    const p = priority?.toLowerCase();
    return { 
        fontWeight: '700', 
        fontSize: '12px',
        color: p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#3b82f6',
    };
};

const statusBadge = (status) => {
    let bg = 'rgba(255,255,255,0.05)'; let color = '#94a3b8';
    if (status === 'Completed') { bg = 'rgba(16, 185, 129, 0.1)'; color = '#10b981'; }
    else if (status === 'InProgress' || status === 'In Progress') { bg = 'rgba(59, 130, 246, 0.1)'; color = '#3b82f6'; }
    return { padding: '4px 10px', borderRadius: '6px', color: color, background: bg, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', border: `1px solid ${color}20` };
};

const emptyStateCard = { background: '#0f172a', borderRadius: '14px', padding: '50px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' };