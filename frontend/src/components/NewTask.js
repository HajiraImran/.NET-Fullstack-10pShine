import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewTask = () => {

    // =========================
    // SAFE USER PARSE
    // =========================
    const storedUser = localStorage.getItem('user');
    const user =
        storedUser && storedUser !== "undefined"
            ? JSON.parse(storedUser)
            : null;

    const isAdmin = user?.role === "Admin";

    // =========================
    // TASK STATE
    // =========================
    const [task, setTask] = useState({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        category: isAdmin ? 'Development' : 'General', 
        dueDate: '',
        userId: ''
    });

    // =========================
    // USERS STATE
    // =========================
    const [users, setUsers] = useState([]);

    const navigate = useNavigate();

    // =========================
    // FETCH USERS
    // =========================
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isAdmin) {
            fetchUsers();
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'http://localhost:5006/api/auth/users',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setUsers(res.data);
        } catch (err) {
            console.error("Users fetch error:", err.response?.data || err.message);
        }
    };

    // =========================
    // SUBMIT TASK
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Login required");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Session expired. Please login again.");
            navigate('/login');
            return;
        }

        try {
            const selectedUser = users.find(u => u.id === Number(task.userId));

            const payload = {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                category: isAdmin ? task.category : "General", 
                dueDate: task.dueDate,
                userId: isAdmin ? Number(task.userId) : 0,
                assignedTo: isAdmin ? (selectedUser?.username || '') : user.username
            };

            await axios.post(
                'http://localhost:5006/api/tasks',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            alert("Task Created Successfully! 🎉");
            navigate('/tasks');

        } catch (err) {
            console.error("Task creation error:", err.response?.data || err.message);
            alert("Something went wrong while creating task");
        }
    };

    return (
        <div style={container} className="form-animate">

            {/* Premium Style Layers */}
            <style>{`
                @keyframes formEntrance {
                    from { transform: translateY(12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .form-animate {
                    animation: formEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .saas-field {
                    background: #090d16 !important;
                    color: #f8fafc !important;
                    border: 1px solid rgba(255, 255, 255, 0.06) !important;
                    transition: all 0.2s ease !important;
                    outline: none !important;
                }
                .saas-field:focus {
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.15) !important;
                }
                .glow-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
                    transition: all 0.2s ease !important;
                }
                .glow-btn:hover {
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3) !important;
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }
                .saas-label {
                    color: #475569;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                }
            `}</style>

            <div style={formHeader}>
                <h2 style={formTitle}>Initialize Task</h2>
                {isAdmin ? (
                    <span style={adminBadge}>Admin Mode</span>
                ) : (
                    <span style={userBadge}>Standard Scope</span>
                )}
            </div>

            <form onSubmit={handleSubmit} style={formStyle}>

                {/* TITLE */}
                <div style={inputGroup}>
                    <label className="saas-label">Task Title</label>
                    <input
                        type="text"
                        placeholder="Define core system task objective..."
                        required
                        value={task.title}
                        onChange={(e) => setTask({ ...task, title: e.target.value })}
                        style={inputStyle}
                        className="saas-field"
                    />
                </div>

                {/* DESCRIPTION */}
                <div style={inputGroup}>
                    <label className="saas-label">Task Context / Details</label>
                    <textarea
                        placeholder="Provide detailed breakdown or scope details..."
                        value={task.description}
                        onChange={(e) => setTask({ ...task, description: e.target.value })}
                        style={textareaStyle}
                        className="saas-field"
                    />
                </div>

                {/* STATUS & PRIORITY */}
                <div style={rowStyle}>
                    <div style={inputGroup}>
                        <label className="saas-label">Lifecycle Status</label>
                        <select 
                            value={task.status} 
                            onChange={(e) => setTask({ ...task, status: e.target.value })} 
                            style={inputStyle}
                            className="saas-field"
                        >
                            <option value="Pending">Pending</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div style={inputGroup}>
                        <label className="saas-label">Severity Level</label>
                        <select 
                            value={task.priority} 
                            onChange={(e) => setTask({ ...task, priority: e.target.value })} 
                            style={inputStyle}
                            className="saas-field"
                        >
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                        </select>
                    </div>
                </div>

                {/* CATEGORY & ASSIGN USER */}
                <div style={rowStyle}>
                    <div style={inputGroup}>
                        <label className="saas-label">Context Category</label>
                        {isAdmin ? (
                            <select 
                                value={task.category} 
                                onChange={(e) => setTask({ ...task, category: e.target.value })} 
                                style={inputStyle}
                                className="saas-field"
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
                                disabled 
                                style={disabledStyle} 
                            />
                        )}
                    </div>

                    {/* DUE DATE (Placed strategically based on role layout) */}
                    {!isAdmin && (
                        <div style={inputGroup}>
                            <label className="saas-label">Target Completion Epoch</label>
                            <input
                                type="date"
                                required
                                value={task.dueDate}
                                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                                style={inputStyle}
                                className="saas-field"
                            />
                        </div>
                    )}

                    {/* ASSIGN USER (Sirf Admin ko dikhega) */}
                    {isAdmin && (
                        <div style={inputGroup}>
                            <label className="saas-label">Target Assignment Node</label>
                            <select
                                required
                                value={task.userId}
                                onChange={(e) => setTask({ ...task, userId: e.target.value })}
                                style={inputStyle}
                                className="saas-field"
                            >
                                <option value="">Select Target Resource</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* DUE DATE IN OWN ROW IF ADMIN */}
                {isAdmin && (
                    <div style={inputGroup}>
                        <label className="saas-label">Target Completion Epoch</label>
                        <input
                            type="date"
                            required
                            value={task.dueDate}
                            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                            style={inputStyle}
                            className="saas-field"
                        />
                    </div>
                )}

                {/* SUBMIT BUTTON */}
                <button type="submit" style={btnStyle} className="glow-btn">
                    Deploy New Task Object
                </button>

            </form>
        </div>
    );
};

export default NewTask;

// =========================
// PREMIUM MATTE DARK STYLES
// =========================
const container = { 
    background: '#0f172a', 
    padding: '35px', 
    maxWidth: '650px', 
    width: '100%',
    margin: '0 auto', 
    borderRadius: '16px', 
    border: '1px solid rgba(255, 255, 255, 0.04)',
    boxSizing: 'border-box'
};

const formHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' };
const formTitle = { margin: 0, fontSize: '20px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px' };

const adminBadge = { background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '600' };
const userBadge = { background: 'rgba(255, 255, 255, 0.04)', color: '#64748b', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)', fontWeight: '600' };

const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 };

const inputStyle = { padding: '11px 14px', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', width: '100%' };
const textareaStyle = { ...inputStyle, minHeight: '90px', resize: 'none' };
const disabledStyle = { ...inputStyle, background: 'rgba(255,255,255,0.02)', color: '#475569', border: '1px dashed rgba(255,255,255,0.05)', cursor: 'not-allowed' };

const rowStyle = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const btnStyle = { padding: '13px', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginTop: '8px' };