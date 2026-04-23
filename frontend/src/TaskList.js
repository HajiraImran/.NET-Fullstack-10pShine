import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');

    // Tasks Load Karne Ke Liye
    const fetchTasks = async () => {
        const res = await axios.get('http://localhost:5006/api/tasks');
        setTasks(res.data);
    };

    useEffect(() => { fetchTasks(); }, []);

    // Naya Task Add Karne Ke Liye (CREATE)
    const addTask = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5006/api/tasks', { title, isCompleted: false });
        setTitle('');
        fetchTasks();
    };

    // Task Delete Karne Ke Liye (DELETE)
    const deleteTask = async (id) => {
        await axios.delete(`http://localhost:5006/api/tasks/${id}`);
        fetchTasks();
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>My Tasks (Requirement #2)</h2>
            <form onSubmit={addTask}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New Task..." required />
                <button type="submit">Add Task</button>
            </form>
            <ul>
                {tasks.map(t => (
                    <li key={t.id}>
                        {t.title} <button onClick={() => deleteTask(t.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TaskList;