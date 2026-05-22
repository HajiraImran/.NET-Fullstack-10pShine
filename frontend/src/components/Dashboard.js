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

            // =========================
            // FETCH STATS
            // =========================
            const statsRes = await axios.get(
                'http://localhost:5006/api/tasks/stats',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStats(statsRes.data);

            // =========================
            // FETCH TASKS
            // =========================
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

            console.error(
                "Dashboard error:",
                err.response?.data || err.message
            );

            if (err.response?.status === 401) {

                localStorage.clear();

                navigate('/login');
            }

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div style={{ padding: '40px' }}>
                Loading Dashboard...
            </div>
        );
    }

    if (!user) return null;

    // =========================
    // CALCULATE COMPLETION
    // =========================
    const completionRate =
        stats.total > 0
            ? Math.round(
                (stats.completed / stats.total) * 100
            )
            : 0;

    const isAdmin = user.role === 'Admin';

    return (
        <div style={wrapper}>

            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}
            <div style={header}>

                <div>
                    <h1 style={title}>
                        Welcome {user.username}
                        {isAdmin ? ' 👑' : ' 👋'}
                    </h1>

                    <p style={subtitle}>
                        Role: {user.role}
                    </p>

                    <p style={subtitle}>
                        Completion Rate: {completionRate}%
                    </p>
                </div>

                {isAdmin && (
                    <Link
                        to="/new-task"
                        style={createBtn}
                    >
                        + Create Task
                    </Link>
                )}

            </div>

            {/* ========================= */}
            {/* STATS */}
            {/* ========================= */}
            <div style={grid}>

                <Box
                    label="Total Tasks"
                    value={stats.total}
                    color="#6c5ce7"
                />

                <Box
                    label="Pending"
                    value={stats.pending}
                    color="#fdcb6e"
                />

                <Box
                    label="In Progress"
                    value={stats.inProgress}
                    color="#0984e3"
                />

                <Box
                    label="Completed"
                    value={stats.completed}
                    color="#00b894"
                />

            </div>

            {/* ========================= */}
            {/* RECENT TASKS */}
            {/* ========================= */}
            <div style={taskSection}>

                <h2 style={taskHeading}>
                    {isAdmin
                        ? 'Recently Assigned Tasks'
                        : 'My Tasks'}
                </h2>

                {recentTasks.length > 0 ? (

                    recentTasks.map(task => (

                        <div
                            key={task.id}
                            style={taskCard}
                        >

                            <div style={taskTop}>

                                <h3 style={{ margin: 0 }}>
                                    {task.title}
                                </h3>

                                <span style={statusBadge(task.status)}>
                                    {task.status}
                                </span>

                            </div>

                            <p style={taskDesc}>
                                {task.description}
                            </p>

                            <div style={taskBottom}>

                                <span>
                                    📅 {
                                        new Date(task.dueDate)
                                            .toLocaleDateString()
                                    }
                                </span>

                                <span>
                                    ⚡ {task.priority}
                                </span>

                                <span>
                                    👤 {task.assignedTo}
                                </span>

                            </div>

                        </div>

                    ))

                ) : (

                    <p>No tasks available</p>

                )}

            </div>

        </div>
    );
};

// =========================
// STATS BOX COMPONENT
// =========================
const Box = ({ label, value, color }) => (

    <div
        style={{
            ...box,
            borderTop: `5px solid ${color}`
        }}
    >
        <h2 style={boxNumber}>
            {value}
        </h2>

        <p style={boxLabel}>
            {label}
        </p>
    </div>
);

export default Dashboard;

// =========================
// STYLES
// =========================

const wrapper = {
    padding: '30px',
    background: '#f5f6fa',
    minHeight: '100vh'
};

const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
};

const title = {
    margin: 0,
    fontSize: '32px'
};

const subtitle = {
    color: '#636e72',
    marginTop: '5px'
};

const createBtn = {
    background: '#6c5ce7',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 'bold'
};

const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
};

const box = {
    background: '#fff',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
};

const boxNumber = {
    margin: 0,
    fontSize: '30px'
};

const boxLabel = {
    color: '#636e72',
    marginTop: '10px'
};

const taskSection = {
    marginTop: '20px'
};

const taskHeading = {
    marginBottom: '20px'
};

const taskCard = {
    background: '#fff',
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
};

const taskTop = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const taskDesc = {
    color: '#636e72',
    marginTop: '10px'
};

const taskBottom = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    fontSize: '14px',
    color: '#636e72',
    flexWrap: 'wrap',
    gap: '10px'
};

const statusBadge = (status) => ({
    padding: '6px 12px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    background:
        status === 'Completed'
            ? '#00b894'
            : status === 'InProgress'
            ? '#0984e3'
            : '#fdcb6e'
});