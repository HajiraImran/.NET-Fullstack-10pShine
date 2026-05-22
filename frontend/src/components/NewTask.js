import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewTask = () => {

    // =========================
    // TASK STATE
    // =========================
    const [task, setTask] = useState({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        category: 'General',
        dueDate: '',
        userId: ''
    });

    // =========================
    // USERS STATE
    // =========================
    const [users, setUsers] = useState([]);

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
    // DEBUG ROLE
    // =========================
    console.log("ROLE IS:", user?.role);

    // =========================
    // FETCH USERS
    // =========================
    useEffect(() => {

        if (!user) {
            navigate('/login');
            return;
        }

        fetchUsers();

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

            console.error(
                "Users fetch error:",
                err.response?.data || err.message
            );
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

            // selected user object
            const selectedUser = users.find(
                u => u.id === Number(task.userId)
            );

            const payload = {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                category: task.category,
                dueDate: task.dueDate,

                // IMPORTANT
                userId: Number(task.userId),

                assignedTo:
                    selectedUser?.username || ''
            };

            console.log("PAYLOAD:", payload);

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

            console.error(
                "Task creation error:",
                err.response?.data || err.message
            );

            if (err.response?.status === 403) {

                alert("Access denied: Only Admin can create tasks");

            } else if (err.response?.status === 401) {

                alert("Session expired. Please login again.");

                localStorage.clear();

                navigate('/login');

            } else {

                alert("Something went wrong while creating task");
            }
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
                    onChange={(e) =>
                        setTask({
                            ...task,
                            title: e.target.value
                        })
                    }
                    style={input}
                />

                {/* DESCRIPTION */}
                <textarea
                    placeholder="Description"
                    value={task.description}
                    onChange={(e) =>
                        setTask({
                            ...task,
                            description: e.target.value
                        })
                    }
                    style={textarea}
                />

                {/* STATUS */}
                <select
                    value={task.status}
                    onChange={(e) =>
                        setTask({
                            ...task,
                            status: e.target.value
                        })
                    }
                    style={input}
                >
                    <option value="Pending">Pending</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>

                {/* PRIORITY */}
                <select
                    value={task.priority}
                    onChange={(e) =>
                        setTask({
                            ...task,
                            priority: e.target.value
                        })
                    }
                    style={input}
                >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                </select>

                {/* CATEGORY */}
                <input
                    type="text"
                    placeholder="Category"
                    value={task.category}
                    onChange={(e) =>
                        setTask({
                            ...task,
                            category: e.target.value
                        })
                    }
                    style={input}
                />

                {/* DUE DATE */}
                <input
                    type="date"
                    required
                    value={task.dueDate}
                    onChange={(e) =>
                        setTask({
                            ...task,
                            dueDate: e.target.value
                        })
                    }
                    style={input}
                />

                {/* ASSIGN USER */}
                <select
                    required
                    value={task.userId}
                    onChange={(e) =>
                        setTask({
                            ...task,
                            userId: e.target.value
                        })
                    }
                    style={input}
                >
                    <option value="">
                        Select User
                    </option>

                    {users.map((u) => (
                        <option
                            key={u.id}
                            value={u.id}
                        >
                            {u.username} ({u.email})
                        </option>
                    ))}
                </select>

                {/* BUTTON */}
                <button
                    type="submit"
                    style={btn}
                >
                    Create Task
                </button>

            </form>
        </div>
    );
};

export default NewTask;

// =========================
// STYLES
// =========================

const container = {
    padding: '30px',
    maxWidth: '600px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
};

const form = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const input = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '15px'
};

const textarea = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    minHeight: '100px',
    fontSize: '15px'
};

const btn = {
    padding: '14px',
    background: '#6c5ce7',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px'
};