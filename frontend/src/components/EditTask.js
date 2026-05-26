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
    const [category, setCategory] = useState('General'); // Default for regular user
    const [assignedTo, setAssignedTo] = useState('');
    const [assignedUserId, setAssignedUserId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State to store users list for Admin dropdown
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
                        // Using the exact auth users path from your NewTask component
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

    // Handle Admin User Change
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

    // Handle Update Submit
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
                category: isAdmin ? category : "General", // Force logic match with backend/NewTask
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

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Task Data...</div>;

    return (
        <div style={formContainer}>
            <h2>✏️ Update Task {isAdmin && <span style={{fontSize: '14px', color: '#6c5ce7'}}>(Admin Mode)</span>}</h2>
            <form onSubmit={handleUpdate} style={formStyle}>
                
                <div style={inputGroup}>
                    <label>Task Title:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
                </div>

                <div style={inputGroup}>
                    <label>Description:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, height: '80px' }} />
                </div>

                <div style={rowStyle}>
                    <div style={inputGroup}>
                        <label>Status:</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                            <option value="Pending">Pending</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div style={inputGroup}>
                        <label>Priority:</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                        </select>
                    </div>
                </div>

                <div style={rowStyle}>
                    {/* 🗂️ MATCHED CATEGORY DROPDOWN FROM NEWTASK */}
                    <div style={inputGroup}>
                        <label>Category:</label>
                        {isAdmin ? (
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                style={inputStyle}
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
                                style={{ ...inputStyle, backgroundColor: '#f1f2f6', cursor: 'not-allowed' }} 
                                disabled 
                            />
                        )}
                    </div>

                    {/* 👥 MATCHED USER DROPDOWN FROM NEWTASK */}
                    <div style={inputGroup}>
                        <label>Assigned To:</label>
                        {isAdmin ? (
                            <select 
                                value={assignedUserId} 
                                onChange={handleUserChange} 
                                style={inputStyle}
                                required
                            >
                                <option value="">Select User</option>
                                {usersList.map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type="text" 
                                value={assignedTo} 
                                style={{ ...inputStyle, backgroundColor: '#f1f2f6', cursor: 'not-allowed' }} 
                                disabled 
                            />
                        )}
                    </div>
                </div>

                <div style={inputGroup}>
                    <label>Due Date:</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" style={submitBtn}>Save Changes</button>
                    <button type="button" onClick={() => navigate('/tasks')} style={cancelBtn}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

// Styles
const formContainer = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' };
const rowStyle = { display: 'flex', gap: '15px' };
const submitBtn = { background: '#6c5ce7', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const cancelBtn = { background: '#eee', color: '#333', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' };

export default EditTask;