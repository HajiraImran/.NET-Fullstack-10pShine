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

    const isAdmin = user?.role === 'Admin'; // Helper boolean for role check

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
            fetchTasks(); // refresh list
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

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div style={loadingStyle}>
                Loading tasks...
            </div>
        );
    }

    // =========================
    // MAIN UI
    // =========================
    return (
        <div style={listContainer}>

            {/* HEADER */}
            <div style={listHeader}>
                <div>
                    <h2 style={{ margin: 0 }}>
                        {isAdmin ? 'All Tasks (Admin Panel)' : 'My Tasks'}
                    </h2>
                    <p style={subText}>
                        Total Tasks: {filteredTasks.length}
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

                    {/* Button dynamic content configuration */}
                    <Link to="/new-task" style={createBtn}>
                        + New Task
                    </Link>
                </div>
            </div>

            {/* TASK GRID */}
            <div style={taskGrid}>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <div key={task.id} style={taskCard}>

                            {/* TOP */}
                            <div style={cardTop}>
                                <h3 style={taskTitle}>{task.title}</h3>
                                <span style={priorityBadge(task.priority)}>
                                    {task.priority}
                                </span>
                            </div>

                            {/* DESC */}
                            <p style={description}>
                                {task.description || "No description"}
                            </p>

                            {/* TASK INFO */}
                            <div style={infoSection}>
                                <div>
                                    <strong>Status:</strong>
                                    <span style={statusText(task.status)}>
                                        {" "}{task.status}
                                    </span>
                                </div>
                                <div><strong>Category:</strong> {task.category}</div>
                                <div><strong>Assigned To:</strong> {task.assignedTo}</div>
                                <div>
                                    <strong>Due:</strong>{" "}
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString()
                                        : "No Date"}
                                </div>
                            </div>

                            {/* ACTIONS FOOTER */}
                            <div style={cardFooter}>
                                <Link to={`/task/${task.id}`} style={viewBtn}>
                                    View
                                </Link>

                                {/* 🔄 UPDATE BUTTON (Strict Check) */}
                                {/* Admin ko sab dikhega, user ko sirf woh dikhega jo uski apni ho AUR admin ki banayi hui na ho */}
                                {(isAdmin || (task.userId === user?.id && task.createdBy !== 'Admin')) && (
                                    <Link to={`/edit-task/${task.id}`} style={editBtn}>
                                        Update
                                    </Link>
                                )}

                                {/* 🗑️ DELETE BUTTON (Strict Check) */}
                                {/* Same security logic: User cannot see delete button if task was created by Admin */}
                                {(isAdmin || (task.userId === user?.id && task.createdBy !== 'Admin')) && (
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        style={deleteBtn}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                        </div>
                    ))
                ) : (
                    <div style={emptyBox}>No tasks found.</div>
                )}
            </div>

        </div>
    );
};

export default TaskList;

// =========================
// STYLES
// =========================
const listContainer = { padding: '10px' };
const loadingStyle = { textAlign: 'center', padding: '50px', fontSize: '18px' };
const listHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' };
const subText = { color: '#777', marginTop: '5px' };
const headerRight = { display: 'flex', gap: '10px', alignItems: 'center' };
const filterSelect = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };
const createBtn = { background: '#6c5ce7', color: '#fff', padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' };
const taskGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '20px' };
const taskCard = { background: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '15px' };
const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const taskTitle = { margin: 0, color: '#2d3436' };
const description = { color: '#636e72', minHeight: '40px' };
const infoSection = { display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' };
const cardFooter = { display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center', gap: '5px' };

const viewBtn = { background: '#0984e3', color: '#fff', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' };
const deleteBtn = { background: '#d63031', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' };
const editBtn = { background: '#fdcb6e', color: '#2d3436', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' };

const priorityBadge = (priority) => ({
    background: priority === 'High' ? '#ff7675' : priority === 'Medium' ? '#fdcb6e' : '#55efc4',
    color: priority === 'Medium' ? '#2d3436' : '#fff', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
});

const statusText = (status) => ({
    color: status === 'Completed' ? 'green' : status === 'InProgress' ? '#0984e3' : '#e17055', fontWeight: 'bold'
});
const emptyBox = { padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '15px' };