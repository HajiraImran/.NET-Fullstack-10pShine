import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            const res = await axios.get(API_URL, {
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
            // Backend updates specific fields on PUT. Send the full object with updated status
            const updatedData = { ...task, status: newStatus };
            await axios.put(API_URL, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTask(updatedData); 
            alert(`Task marked as ${newStatus}!`);
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
                await axios.delete(API_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Task deleted successfully!");
                navigate('/dashboard'); 
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    if (loading) return <div style={centerStyle}>Loading Task Details...</div>;
    if (!task) return <div style={centerStyle}>Task not found!</div>;

    return (
        <div style={containerStyle}>
            <button onClick={() => navigate(-1)} style={backBtn}>← Back</button>
            
            <div style={cardStyle}>
                <div style={headerStyle}>
                    <h1 style={{ margin: 0 }}>{task.title}</h1>
                    <span style={badgeStyle(task.priority)}>{task.priority} Priority</span>
                </div>
                
                <hr style={hrStyle} />
                
                <div style={infoGrid}>
                    <p><strong>Status:</strong> <span style={{color: task.status === 'Completed' ? 'green' : 'orange'}}>{task.status}</span></p>
                    <p><strong>Category:</strong> {task.category}</p>
                    <p><strong>Assigned To:</strong> {task.assignedTo || "Unassigned"}</p>
                    <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>

                <div style={descBox}>
                    <strong>Description:</strong>
                    <p style={{ marginTop: '10px', color: '#555' }}>{task.description || "No description provided."}</p>
                </div>

                <div style={actionArea}>
                    {task.status !== 'Completed' && (
                        <button onClick={() => handleStatusUpdate('Completed')} style={completeBtn}>
                            Mark as Completed ✅
                        </button>
                    )}
                    {isAdmin && (
                        <button onClick={handleDelete} style={deleteBtn}>
                            Delete Task 🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Styles (Aapke original styles retain kiye hain)
const containerStyle = { padding: '40px', backgroundColor: '#f5f6fa', minHeight: '80vh' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '700px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
const hrStyle = { border: '0', borderTop: '1px solid #eee', margin: '20px 0' };
const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' };
const descBox = { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '25px' };
const actionArea = { display: 'flex', gap: '15px', borderTop: '1px solid #eee', paddingTop: '20px' };
const backBtn = { background: 'none', border: 'none', color: '#6c5ce7', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' };
const completeBtn = { flex: 1, padding: '12px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtn = { padding: '12px', backgroundColor: '#ff7675', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const centerStyle = { textAlign: 'center', marginTop: '50px', fontSize: '18px' };
const badgeStyle = (p) => ({
    backgroundColor: p === 'High' ? '#ff7675' : '#dfe6e9',
    color: p === 'High' ? 'white' : '#2d3436',
    padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
});

export default TaskDetail;