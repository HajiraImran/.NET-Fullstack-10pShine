import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditTask = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Pending');
    const [priority, setPriority] = useState('Medium');
    const [category, setCategory] = useState('General'); 
    const [assignedTo, setAssignedTo] = useState('');
    const [assignedUserId, setAssignedUserId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [usersList, setUsersList] = useState([]);

    // Safe user parse
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    const isAdmin = currentUser?.role === 'Admin';

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Fetch Task Details
                const taskRes = await axios.get(`http://localhost:5006/api/tasks/${id}`, { headers });
                const task = taskRes.data;
                
                setTitle(task.title || '');
                setDescription(task.description || '');
                setStatus(task.status || 'Pending');
                setPriority(task.priority || 'Medium');
                setCategory(task.category || 'General');
                setAssignedTo(task.assignedTo || '');
                setAssignedUserId(task.userId || '');
                if (task.dueDate) {
                    setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
                }

                // 2. Fetch Users List if Admin
                if (isAdmin) {
                    try {
                        const usersRes = await axios.get('http://localhost:5006/api/auth/users', { headers });
                        setUsersList(usersRes.data);
                    } catch (userErr) {
                        console.error("Error fetching users list:", userErr);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Error loading update form data:", err);
                alert("Failed to load task data");
                navigate('/tasks');
            }
        };

        loadFormData();
    }, [id, navigate, isAdmin]);

    const handleUserChange = (e) => {
        const selectedId = e.target.value;
        setAssignedUserId(selectedId);
        
        const selectedUser = usersList.find(u => u.id === parseInt(selectedId));
        if (selectedUser) {
            setAssignedTo(selectedUser.username);
        } else {
            setAssignedTo('');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            const updatedTask = {
                id: parseInt(id),
                title,
                description,
                status,
                priority,
                category: isAdmin ? category : "General", 
                dueDate,
                userId: isAdmin ? (assignedUserId ? parseInt(assignedUserId) : 0) : currentUser?.id,
                assignedTo: isAdmin ? assignedTo : currentUser?.username
            };
            
            await axios.put(`http://localhost:5006/api/tasks/${id}`, updatedTask, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Task updated successfully! 🎉");
            navigate('/tasks');
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update task");
        }
    };

    if (loading) {
        return (
            <div style={loadingWrapper}>
                <div style={spinnerStyle}></div>
                <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>PULLING CONFIGURATION OBJECTS...</div>
            </div>
        );
    }

    return (
        <div style={formWrapper} className="form-animate">
            
            {/* Embedded Luxury Pseudo-Classes */}
            <style>{`
                @keyframes formEntrance {
                    from { transform: translateY(12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .form-animate {
                    animation: formEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .saas-input {
                    background: #090d16 !important;
                    color: #f8fafc !important;
                    border: 1px solid rgba(255, 255, 255, 0.06) !important;
                    transition: all 0.2s ease !important;
                }
                .saas-input:focus {
                    outline: none !important;
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.15) !important;
                }
                .glow-save-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
                    transition: all 0.2s ease !important;
                }
                .glow-save-btn:hover {
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3) !important;
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }
                .saas-cancel-btn {
                    background: rgba(255, 255, 255, 0.03) !important;
                    color: #94a3b8 !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    transition: all 0.2s ease !important;
                }
                .saas-cancel-btn:hover {
                    background: rgba(255, 255, 255, 0.06) !important;
                    color: #f8fafc !important;
                }
            `}</style>

            <div style={formHeaderBlock}>
                <h2 style={formTitle}>Update Task Config</h2>
                {isAdmin ? (
                    <span style={adminBadge}>Admin Mode Enabled</span>
                ) : (
                    <span style={userBadge}>Standard Node Access</span>
                )}
            </div>

            <form onSubmit={handleUpdate} style={formStyle}>
                
                {/* TITLE */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Task Identifier / Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        style={inputStyle} 
                        className="saas-input"
                    />
                </div>

                {/* DESCRIPTION */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Execution Instructions (Description)</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        style={{ ...inputStyle, height: '90px', resize: 'none' }} 
                        className="saas-input"
                    />
                </div>

                {/* ROW 1: STATUS & PRIORITY */}
                <div style={rowStyle}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Lifecycle Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle} className="saas-input">
                            <option value="Pending">Pending</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Severity Level (Priority)</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle} className="saas-input">
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                        </select>
                    </div>
                </div>

                {/* ROW 2: CATEGORY & ASSIGNED USER */}
                <div style={rowStyle}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Context Category</label>
                        {isAdmin ? (
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                style={inputStyle}
                                className="saas-input"
                            >
                                <option value="Development">Development</option>
                                <option value="Testing">Testing</option>
                                <option value="HR / Recruitment">HR / Recruitment</option>
                                <option value="Design">Design</option>
                                <option value="Management">Management</option>
                            </select>
                        ) : (
                            <input 
                                type="text" 
                                value="General" 
                                style={disabledInputStyle} 
                                disabled 
                            />
                        )}
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Target Resource Assignment</label>
                        {isAdmin ? (
                            <select 
                                value={assignedUserId} 
                                onChange={handleUserChange} 
                                style={inputStyle}
                                className="saas-input"
                                required
                            >
                                <option value="">Select User Link</option>
                                {usersList.map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type="text" 
                                value={assignedTo} 
                                style={disabledInputStyle} 
                                disabled 
                            />
                        )}
                    </div>
                </div>

                {/* DUE DATE */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Target Completion Epoch (Due Date)</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} className="saas-input" />
                </div>

                {/* SUBMIT ACTIONS CONTAINER */}
                <div style={actionRow}>
                    <button type="submit" style={submitBtn} className="glow-save-btn">Save Deployment Changes</button>
                    <button type="button" onClick={() => navigate('/tasks')} style={cancelBtn} className="saas-cancel-btn">Abort</button>
                </div>
            </form>
        </div>
    );
};

// =========================
// LUXURY SAAS STYLING MAP
// =========================
const formWrapper = { 
    background: '#0f172a', 
    padding: '35px', 
    borderRadius: '16px', 
    border: '1px solid rgba(255, 255, 255, 0.04)',
    maxWidth: '650px', 
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box'
};

const loadingWrapper = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: '12px' };
const spinnerStyle = { width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.05)', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };

const formHeaderBlock = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' };
const formTitle = { margin: 0, fontSize: '20px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px' };

const adminBadge = { background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '600', uppercase: 'true' };
const userBadge = { background: 'rgba(255, 255, 255, 0.04)', color: '#64748b', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)', fontWeight: '600' };

const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 };

const labelStyle = { color: '#475569', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { padding: '11px 14px', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', width: '100%' };
const disabledInputStyle = { ...inputStyle, background: 'rgba(255,255,255,0.02)', color: '#475569', border: '1px dashed rgba(255,255,255,0.05)', cursor: 'not-allowed' };

const rowStyle = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const actionRow = { display: 'flex', gap: '12px', marginTop: '10px' };

const submitBtn = { color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };
const cancelBtn = { padding: '12px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };

export default EditTask;