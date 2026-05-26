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

    const isAdmin = user?.role === "Admin"; // Role checker

    // =========================
    // TASK STATE
    // =========================
    const [task, setTask] = useState({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        category: isAdmin ? 'Development' : 'General', // Admin ke liye default dropdown value, User ke liye General
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
                category: isAdmin ? task.category : "General", // Admin ki select ki hui category jayegi, user ki hamesha General
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

            alert("Task Created Successfully!");
            navigate('/tasks');

        } catch (err) {
            console.error("Task creation error:", err.response?.data || err.message);
            alert("Something went wrong while creating task");
        }
    };

    return (
        <div style={container}>

            <h2>Create New Task</h2>

            <form onSubmit={handleSubmit} style={form}>

                {/* TITLE */}
                <input
                    type="text"
                    placeholder="Task Title"
                    required
                    value={task.title}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                    style={input}
                />

                {/* DESCRIPTION */}
                <textarea
                    placeholder="Description"
                    value={task.description}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                    style={textarea}
                />

                {/* STATUS */}
                <select value={task.status} onChange={(e) => setTask({ ...task, status: e.target.value })} style={input}>
                    <option value="Pending">Pending</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>

                {/* PRIORITY */}
                <select value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })} style={input}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                </select>

                {/* CATEGORY FIELD */}
                {isAdmin ? (
                    /* Admin ke liye Dropdown List */
                    <select 
                        value={task.category} 
                        onChange={(e) => setTask({ ...task, category: e.target.value })} 
                        style={input}
                    >
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                        <option value="HR / Recruitment">HR / Recruitment</option>
                        <option value="Design">Design</option>
                        <option value="Management">Management</option>
                    </select>
                ) : (
                    /* Regular User ke liye locked field jo sirf "General" dikhayegi */
                    <input
                        type="text"
                        value="General"
                        disabled // Is se user type nahi kar sakega, field lock ho jayegi
                        style={{ ...input, backgroundColor: '#f1f2f6', cursor: 'not-allowed' }} 
                    />
                )}

                {/* DUE DATE */}
                <input
                    type="date"
                    required
                    value={task.dueDate}
                    onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                    style={input}
                />

                {/* ASSIGN USER (Sirf Admin ko dikhega) */}
                {isAdmin && (
                    <select
                        required
                        value={task.userId}
                        onChange={(e) => setTask({ ...task, userId: e.target.value })}
                        style={input}
                    >
                        <option value="">Select User</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.username} ({u.email})
                            </option>
                        ))}
                    </select>
                )}

                {/* BUTTON */}
                <button type="submit" style={btn}>
                    Create Task
                </button>

            </form>
        </div>
    );
};

export default NewTask;

// =========================
// STYLES (Unchanged)
// =========================
const container = { padding: '30px', maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' };
const form = { display: 'flex', flexDirection: 'column', gap: '15px' };
const input = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px' };
const textarea = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '100px', fontSize: '15px' };
const btn = { padding: '14px', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' };