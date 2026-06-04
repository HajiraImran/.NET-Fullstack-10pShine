import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const TaskList = () => {

    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // =========================
    // SAFE USER PARSE
    // =========================
    const storedUser = localStorage.getItem('user');
    const user = storedUser && storedUser !== "undefined"
        ? JSON.parse(storedUser)
        : null;

    const isAdmin = user?.role === 'Admin';

    // =========================
    // LOAD TASKS
    // =========================
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchTasks();
    }, []);

    // =========================
    // FETCH TASKS
    // =========================
    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'http://localhost:5006/api/tasks',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setTasks(res.data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert("Session expired. Please login again.");
                localStorage.clear();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE TASK
    // =========================
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this task?"
        );
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5006/api/tasks/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert("Task deleted successfully");
            fetchTasks();
        } catch (err) {
            console.error(err);
            if (err.response?.status === 400 || err.response?.status === 403) {
                alert(err.response.data.message || "Action denied.");
            } else {
                alert("Delete failed");
            }
        }
    };

    // =========================
    // FILTER TASKS
    // =========================
    const filteredTasks = tasks.filter(task =>
        filter === 'All'
            ? true
            : task.status === filter
    );

    if (loading) {
        return (
            <div style={loadingStyle}>
                <div style={spinnerStyle}></div>
                <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>FETCHING PIPELINE NODES...</div>
            </div>
        );
    }

    return (
        <div style={listContainer}>
            
            {/* Real-World Premium CSS Engine */}
            <style>{`
                @keyframes viewEntrance {
                    from { transform: translateY(12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .view-animate {
                    animation: viewEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .pipeline-card {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
                .pipeline-card:hover {
                    transform: translateY(-3px) !important;
                    border-color: rgba(99, 102, 241, 0.3) !important;
                    box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.6) !important;
                }
                .action-node-btn {
                    transition: all 0.2s ease !important;
                }
                .action-node-btn:hover {
                    filter: brightness(1.2);
                    transform: translateY(-1px);
                }
                .glow-create-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
                    transition: all 0.2s ease !important;
                }
                .glow-create-btn:hover {
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3) !important;
                    transform: translateY(-1px);
                }
            `}</style>

            {/* ========================= */}
            {/* FILTER & HEADER HUB */}
            {/* ========================= */}
            <div style={listHeader} className="view-animate">
                <div>
                    <h2 style={viewTitle}>
                        {isAdmin ? 'Global Task Registry' : 'Active Workspace Backlog'}
                    </h2>
                    <p style={subText}>
                        Total Filtered Contexts: <span style={{color: '#6366f1', fontWeight: '600'}}>{filteredTasks.length}</span>
                    </p>
                </div>

                <div style={headerRight}>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={filterSelect}
                    >
                        <option value="All">All Tasks</option>
                        <option value="Pending">Pending</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <Link to="/new-task" style={createBtn} className="glow-create-btn">
                        + New Task
                    </Link>
                </div>
            </div>

            {/* ========================= */}
            {/* MODERN WORKSPACE GRID */}
            {/* ========================= */}
            <div style={taskGrid} className="view-animate">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <div key={task.id} style={taskCard} className="pipeline-card">

                            {/* TOP BLOCK */}
                            <div style={cardTop}>
                                <h3 style={taskTitleStyle}>{task.title}</h3>
                                <span style={priorityBadge(task.priority)}>
                                    {task.priority}
                                </span>
                            </div>

                            {/* EXPORTED DESCRIPTION */}
                            <p style={descriptionStyle}>
                                {task.description || "No core description provided for this registry object."}
                            </p>

                            {/* STRUCTURED SPECS */}
                            <div style={infoSection}>
                                <div style={metaItemRow}>
                                    <span style={metaLabel}>Lifecycle Status:</span>
                                    <span style={statusTextStyle(task.status)}>{task.status === 'InProgress' ? 'In Progress' : task.status}</span>
                                </div>
                                <div style={metaItemRow}>
                                    <span style={metaLabel}>Cluster Category:</span>
                                    <span style={metaValue}>{task.category || 'General'}</span>
                                </div>
                                <div style={metaItemRow}>
                                    <span style={metaLabel}>Assigned Node:</span>
                                    <span style={{...metaValue, color: '#6366f1'}}>{task.assignedTo || 'Unassigned'}</span>
                                </div>
                                <div style={metaItemRow}>
                                    <span style={metaLabel}>Target Deadline:</span>
                                    <span style={metaValue}>
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : "No Limit"}
                                    </span>
                                </div>
                            </div>

                            {/* CONTROL ACTIONS BAR */}
                            <div style={cardFooter}>
                                <Link to={`/task/${task.id}`} style={viewBtn} className="action-node-btn">
                                    View Link
                                </Link>

                                {/* STRICT SECURITY HOVER ACTIONS */}
                                {(isAdmin || (task.userId === user?.id && task.createdBy !== 'Admin')) && (
                                    <Link to={`/edit-task/${task.id}`} style={editBtn} className="action-node-btn">
                                        Update
                                    </Link>
                                )}

                                {(isAdmin || (task.userId === user?.id && task.createdBy !== 'Admin')) && (
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        style={deleteBtn}
                                        className="action-node-btn"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                        </div>
                    ))
                ) : (
                    <div style={emptyBox}>
                        <h4 style={{margin: '0 0 6px 0', color: '#f8fafc', fontSize: '15px'}}>Registry cache empty</h4>
                        <p style={{margin: 0, color: '#64748b', fontSize: '13px'}}>No tasks correspond to the selected execution scope.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default TaskList;

// =========================
// PREMIUM METALLIC DESIGN SYSTEM
// =========================
const listContainer = { width: '100%', boxSizing: 'border-box' };
const loadingStyle = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: '12px' };
const spinnerStyle = { width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.05)', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };

const listHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' };
const viewTitle = { margin: 0, fontSize: '22px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.4px' };
const subText = { color: '#64748b', margin: '4px 0 0 0', fontSize: '13px' };

const headerRight = { display: 'flex', gap: '12px', alignItems: 'center' };
const filterSelect = { background: '#0f172a', color: '#cbd5e1', padding: '9px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', fontWeight: '500', outline: 'none', cursor: 'pointer' };
const createBtn = { color: '#fff', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600', letterSpacing: '0.2px' };

const taskGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', width: '100%' };
const taskCard = { background: '#0f172a', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.04)', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' };

const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' };
const taskTitleStyle = { margin: 0, color: '#f8fafc', fontSize: '16px', fontWeight: '600', letterSpacing: '-0.2px' };
const descriptionStyle = { color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: 0, minHeight: '42px' };

const infoSection = { display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px' };
const metaItemRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const metaLabel = { color: '#475569', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.4px' };
const metaValue = { color: '#cbd5e1', fontWeight: '500' };

const cardFooter = { display: 'flex', justifyContent: 'flex-start', marginTop: '6px', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px' };

const viewBtn = { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.04)' };
const editBtn = { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(245, 158, 11, 0.15)' };
const deleteBtn = { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };

const priorityBadge = (priority) => {
    const p = priority?.toLowerCase();
    const color = p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#10b981';
    return {
        background: `${color}15`,
        color: color,
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        border: `1px solid ${color}20`
    };
};

const statusTextStyle = (status) => {
    let color = '#94a3b8';
    if (status === 'Completed') color = '#10b981';
    else if (status === 'InProgress' || status === 'In Progress') color = '#3b82f6';
    return { color: color, fontWeight: '600' };
};

const emptyBox = { gridColumn: '1 / -1', padding: '50px', textAlign: 'center', background: '#0f172a', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.08)' };