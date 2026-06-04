import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Note: standard axios import is usually just 'axios'
import axiosActual from 'axios'; // Fallback to standard axis handling just in case

const TaskDetail = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const user = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    const isAdmin = user?.role === 'Admin';

    const API_URL = `http://localhost:5006/api/tasks/${id}`;

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchTask();
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await axiosActual.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTask(res.data);
        } catch (err) {
            console.error("Task load nahi hua:", err);
            alert("Error fetching task details");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const updatedData = { ...task, status: newStatus };
            await axiosActual.put(API_URL, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTask(updatedData); 
            alert(`Task marked as ${newStatus}! 🎉`);
        } catch (err) {
            alert("Update failed. Check your connection or permissions.");
        }
    };

    const handleDelete = async () => {
        if (!isAdmin) {
            alert("Only Admins can delete tasks!");
            return;
        }
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await axiosActual.delete(API_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Task deleted successfully!");
                navigate('/tasks'); 
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    if (loading) {
        return (
            <div style={centerStyle}>
                <div style={spinnerStyle}></div>
                <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>FETCHING PROTOCOL DATA...</div>
            </div>
        );
    }

    if (!task) {
        return (
            <div style={centerStyle}>
                <div style={{ color: '#ef4444', fontWeight: '600', marginBottom: '15px' }}>
                    ⚠️ Target Object Not Found
                </div>
                <button onClick={() => navigate(-1)} className="saas-back-btn">
                    Return to Console
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={innerWrapper} className="form-animate">
                
                {/* Embedded Responsive Styles Layer */}
                <style>{`
                    @keyframes taskEntrance {
                        from { transform: translateY(12px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    .form-animate {
                        animation: taskEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        width: 100%;
                        max-width: 700px;
                    }
                    .saas-back-btn {
                        background: none !important;
                        border: none !important;
                        color: #94a3b8 !important;
                        cursor: pointer !important;
                        font-weight: 600 !important;
                        font-size: 14px !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        gap: 6px !important;
                        margin-bottom: 20px !important;
                        transition: color 0.2s ease !important;
                        padding: 0 !important;
                    }
                    .saas-back-btn:hover {
                        color: #f8fafc !important;
                    }
                    .action-complete-btn {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                        color: white !important;
                        transition: all 0.2s ease !important;
                    }
                    .action-complete-btn:hover {
                        box-shadow: 0 0 15px rgba(16, 185, 129, 0.25) !important;
                        filter: brightness(1.1);
                        transform: translateY(-1px);
                    }
                    .action-delete-btn {
                        background: rgba(239, 68, 68, 0.06) !important;
                        color: #f87171 !important;
                        border: 1px solid rgba(239, 68, 68, 0.15) !important;
                        transition: all 0.2s ease !important;
                    }
                    .action-delete-btn:hover {
                        background: #ef4444 !important;
                        color: white !important;
                        border-color: #ef4444 !important;
                        box-shadow: 0 0 15px rgba(239, 68, 68, 0.2) !important;
                    }
                    .meta-label {
                        color: #475569;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .meta-value {
                        color: #cbd5e1;
                        font-size: 14px;
                        font-weight: 500;
                        margin-top: 4px;
                    }
                `}</style>

                <button onClick={() => navigate(-1)} className="saas-back-btn">
                    <span>←</span> Return to List
                </button>
                
                <div style={cardStyle}>
                    
                    {/* HEADER SECTION */}
                    <div style={headerStyle}>
                        <h1 style={titleStyle}>{task.title}</h1>
                        <span style={badgeStyle(task.priority)}>{task.priority} Priority</span>
                    </div>
                    
                    {/* METADATA GRID BLOCKS */}
                    <div style={infoGrid}>
                        <div style={metaBlock}>
                            <div className="meta-label">Lifecycle Status</div>
                            <div className="meta-value">
                                <span style={statusStyle(task.status)}>
                                    {task.status === 'InProgress' ? 'In Progress' : task.status}
                                </span>
                            </div>
                        </div>
                        
                        <div style={metaBlock}>
                            <div className="meta-label">Context Category</div>
                            <div className="meta-value">{task.category}</div>
                        </div>
                        
                        <div style={metaBlock}>
                            <div className="meta-label">Assigned Resource</div>
                            <div className="meta-value" style={{ color: task.assignedTo ? '#cbd5e1' : '#475569' }}>
                                {task.assignedTo || "Unassigned"}
                            </div>
                        </div>
                        
                        <div style={metaBlock}>
                            <div className="meta-label">Target Completion Epoch</div>
                            <div className="meta-value">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No Date Set'}
                            </div>
                        </div>
                    </div>

                    {/* DESCRIPTION CONTENT FIELD */}
                    <div style={descBox}>
                        <div className="meta-label" style={{ marginBottom: '8px' }}>Scope & Execution Guidelines</div>
                        <p style={descText}>{task.description || "No specific system documentation or instructions appended to this item."}</p>
                    </div>

                    {/* DYNAMIC FORM BUTTONS AREA */}
                    <div style={actionArea}>
                        {task.status !== 'Completed' && (
                            <button onClick={() => handleStatusUpdate('Completed')} style={completeBtn} className="action-complete-btn">
                                Resolve & Close Task
                            </button>
                        )}
                        {isAdmin && (
                            <button onClick={handleDelete} style={deleteBtn} className="action-delete-btn">
                                Terminate Object
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================
// PREMIUM MATTE DARK STYLES MAP
// =========================
const containerStyle = { 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: '90vh',
    padding: '20px',
    boxSizing: 'border-box',
};

const innerWrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%'
};

const cardStyle = { 
    backgroundColor: '#0f172a', 
    padding: '35px', 
    borderRadius: '16px', 
    border: '1px solid rgba(255, 255, 255, 0.04)',
    width: '100%',
    boxSizing: 'border-box'
};

const headerStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    gap: '20px',
    width: '100%',
    marginBottom: '30px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '20px'
};

const titleStyle = { 
    margin: 0, 
    fontSize: '22px', 
    fontWeight: '700', 
    color: '#f8fafc',
    letterSpacing: '-0.5px',
    lineHeight: '1.3'
};

const infoGrid = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '20px', 
    width: '100%',
    marginBottom: '30px' 
};

const metaBlock = {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    padding: '12px 16px',
    borderRadius: '10px'
};

const descBox = { 
    backgroundColor: '#090d16', 
    padding: '20px', 
    borderRadius: '12px', 
    border: '1px solid rgba(255, 255, 255, 0.04)',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '30px' 
};

const descText = { 
    marginTop: '0',
    marginBottom: '0', 
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: '1.6'
};

const actionArea = { 
    display: 'flex', 
    gap: '12px', 
    justifyContent: 'flex-start',
    width: '100%',
    flexWrap: 'wrap'
};

const completeBtn = { 
    padding: '12px 24px', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '13px'
};

const deleteBtn = { 
    padding: '12px 24px', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '13px'
};

const centerStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '50vh', 
    gap: '12px' 
};

const spinnerStyle = { 
    width: '20px', 
    height: '20px', 
    border: '2px solid rgba(255,255,255,0.05)', 
    borderTop: '2px solid #6366f1', 
    borderRadius: '50%', 
    animation: 'spin 0.8s linear infinite' 
};

const badgeStyle = (priority) => ({
    backgroundColor: priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.04)',
    color: priority === 'High' ? '#f87171' : '#94a3b8',
    padding: '5px 12px', 
    borderRadius: '6px', 
    fontSize: '11px', 
    fontWeight: '600',
    border: priority === 'High' ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(255,255,255,0.04)',
    whiteSpace: 'nowrap'
});

const statusStyle = (status) => ({
    color: status === 'Completed' ? '#10b981' : '#f59e0b',
    fontWeight: '600'
});

export default TaskDetail;