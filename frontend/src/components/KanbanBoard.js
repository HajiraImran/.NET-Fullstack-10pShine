import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as signalR from "@microsoft/signalr";

const KanbanBoard = () => {
    const [tasks, setTasks] = useState([]);
    const token = localStorage.getItem("token");

    // 🔥 STATE FOR SEARCH & FILTERS
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriority, setSelectedPriority] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const fetchTasks = async () => {
        try {
            const res = await axios.get("http://localhost:5006/api/tasks", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (err) {
            console.error("Error fetching Kanban tasks:", err);
        }
    };

    // ==========================================
    // 📡 SIGNALR LIVE CONNECTION & LISTENERS
    // ==========================================
    useEffect(() => {
        fetchTasks();

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5006/taskHub", { 
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        connection.start()
            .then(() => {
                console.log("🚀 Connected to SignalR TaskHub Successfully!");

                connection.on("ReceiveStatusUpdate", (taskId, newStatus, updatedTaskFromBackend) => {
                    setTasks(prevTasks => {
                        const taskExists = prevTasks.some(t => t.id === parseInt(taskId));
                        if (taskExists) {
                            return prevTasks.map(t => 
                                t.id === parseInt(taskId) 
                                    ? { ...t, ...updatedTaskFromBackend, status: newStatus } 
                                    : t
                            );
                        }
                        return prevTasks; 
                    });
                });

                connection.on("ReceiveTaskCreated", (newTask) => {
                    setTasks(prevTasks => {
                        if (prevTasks.some(t => t.id === newTask.id)) return prevTasks;
                        return [...prevTasks, newTask];
                    });
                });

                connection.on("ReceiveTaskDeleted", (taskId) => {
                    setTasks(prevTasks => prevTasks.filter(t => t.id !== parseInt(taskId)));
                });
            })
            .catch(err => console.error("❌ SignalR Connection Failed: ", err));

        return () => {
            if (connection) {
                connection.off("ReceiveStatusUpdate");
                connection.off("ReceiveTaskCreated");
                connection.off("ReceiveTaskDeleted");
                connection.stop();
            }
        };
    }, []);

    // ==========================================
    // 📥 EXPORT TASKS TO JSON FILE
    // ==========================================
    const exportTasks = () => {
        if (tasks.length === 0) {
            alert("Export karne ke liye koi tasks maujood nahi hain!");
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Kanban_Export_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    // ==========================================
    // 📤 IMPORT TASKS FROM JSON FILE
    // ==========================================
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const importedTasks = JSON.parse(event.target.result);
                if (!Array.isArray(importedTasks)) {
                    alert("Invalid file structure! Data aik array format me hona chahiye.");
                    return;
                }

                for (const task of importedTasks) {
                    const { id, ...newTaskData } = task; 
                    await axios.post("http://localhost:5006/api/tasks", {
                        ...newTaskData,
                        assignedTo: newTaskData.assignedTo || "Unassigned"
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                alert("Tamam tasks kamyabi se import aur sync ho chuke hain!");
                fetchTasks();
            } catch (err) {
                console.error("Import operation failed:", err);
                alert("File standard matching me fail hui! Check karein ke file valid JSON hai.");
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    // ==========================================
    // FIXED HANDLE DRAG END (FOR ASSIGNED USERS)
    // ==========================================
    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const task = tasks.find(t => t.id.toString() === draggableId);
        if (!task) return;

        const newStatus = destination.droppableId;

        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        try {
            await axios.put(
                `http://localhost:5006/api/tasks/${task.id}`,
                { 
                    ...task, 
                    status: newStatus,
                    assignedTo: task.assignedTo || "Unassigned" 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Backend Kanban update sync error:", err);
            fetchTasks();
        }
    };

    // ==========================================
    // 🔥 FILTER & SEARCH LOGIC
    // ==========================================
    const getFilteredTasksByStatus = (status) => {
        return tasks.filter(task => {
            // 1. Column Status Check
            if (task.status !== status) return false;

            // 2. Text Search Check (Title ya Description dono par match karega)
            const matchesSearch = 
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

            // 3. Priority Filter Check
            const matchesPriority = selectedPriority === "All" || task.priority === selectedPriority;

            // 4. Category Filter Check
            const taskCategory = task.category || "General";
            const matchesCategory = selectedCategory === "All" || taskCategory.toLowerCase() === selectedCategory.toLowerCase();

            return matchesSearch && matchesPriority && matchesCategory;
        });
    };

    // Dropdowns ke liye unique categories nikalne ka helper
    const getUniqueCategories = () => {
        const categories = tasks.map(t => t.category || "General");
        return ["All", ...new Set(categories)];
    };

    const getPriorityColor = (p) => {
        if (p === 'High') return 'rgba(239, 68, 68, 0.4)';
        if (p === 'Medium') return 'rgba(245, 158, 11, 0.4)';
        return 'rgba(148, 163, 184, 0.2)';
    };

    const Column = ({ title, status, glowColor, countColor }) => {
        // Filtered tasks get karein
        const columnTasks = getFilteredTasksByStatus(status);
        
        return (
            <div style={columnContainer}>
                <div style={columnHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={headerDot(glowColor)}></span>
                        <h3 style={columnTitleText}>{title}</h3>
                    </div>
                    <span style={counterBadge(countColor)}>{columnTasks.length}</span>
                </div>

                <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ 
                                ...columnStyle, 
                                backgroundColor: snapshot.isDraggingOver 
                                    ? 'rgba(255, 255, 255, 0.02)' 
                                    : 'rgba(255, 255, 255, 0.01)'
                            }}
                        >
                            {columnTasks.map((task, index) => (
                                <Draggable
                                    key={task.id}
                                    draggableId={task.id.toString()}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...cardStyle,
                                                borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                                                boxShadow: snapshot.isDragging 
                                                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.15)" 
                                                    : "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
                                                background: snapshot.isDragging ? "#1e293b" : "#0f172a",
                                                transform: provided.draggableProps.style?.transform,
                                                ...provided.draggableProps.style
                                            }}
                                            className="kanban-card"
                                        >
                                            <div style={cardHeaderRow}>
                                                <span style={categoryTag}>{task.category || 'General'}</span>
                                                {task.priority === 'High' && <span style={highPriorityAlert}>High</span>}
                                            </div>
                                            
                                            <h4 style={cardTitle}>{task.title}</h4>
                                            
                                            {task.description && (
                                                <p style={cardDesc}>
                                                    {task.description.length > 85 
                                                        ? `${task.description.substring(0, 85)}...` 
                                                        : task.description}
                                                </p>
                                            )}

                                            <div style={cardFooterRow}>
                                                <div style={assigneeWrapper}>
                                                    <div style={avatarCircle}>
                                                        {(task.assignedTo || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <span style={assigneeName}>{task.assignedTo || 'Unassigned'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        );
    };

    return (
        <div style={boardViewport}>
            <style>{`
                .kanban-card {
                    transition: border-color 0.2s, background-color 0.2s;
                    border: 1px solid rgba(255, 255, 255, 0.04);
                }
                .kanban-card:hover {
                    border-color: rgba(255, 255, 255, 0.08);
                    background-color: #141e30 !important;
                }
                .action-btn {
                    background: #0f172a;
                    color: #94a3b8;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }
                .action-btn:hover {
                    background: #1e293b;
                    color: #f8fafc;
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                .filter-input {
                    background: #0f172a;
                    color: #f8fafc;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    outline: none;
                    transition: all 0.2s;
                }
                .filter-input:focus {
                    border-color: rgba(99, 102, 241, 0.4);
                    background: #141e30;
                }
                .filter-select {
                    background: #0f172a;
                    color: #94a3b8;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    outline: none;
                    cursor: pointer;
                }
                .filter-select:focus {
                    border-color: rgba(99, 102, 241, 0.4);
                    color: #f8fafc;
                }
            `}</style>

            {/* 🛠️ TOP CONTROL BAR (BAR CONTROLLING EXPORTS & FILTERS) */}
            <div style={controlBarWrapper}>
                {/* Export / Import Left Panel */}
                <div style={utilityGroup}>
                    <button className="action-btn" onClick={exportTasks}>
                        <span>📥</span> Export Backup
                    </button>
                    
                    <label className="action-btn" style={{ margin: 0 }}>
                        <span>📤</span> Import Backup
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleImport} 
                            style={{ display: 'none' }} 
                        />
                    </label>
                </div>

                {/* 🔥 NEW: SEARCH & FILTERS RIGHT PANEL */}
                <div style={filterGroup}>
                    <input 
                        type="text"
                        className="filter-input"
                        placeholder="🔍 Search title or desc..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ minWidth: "220px" }}
                    />

                    <select 
                        className="filter-select"
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                    >
                        <option value="All">⚠️ All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <select 
                        className="filter-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {getUniqueCategories().map(cat => (
                            <option key={cat} value={cat}>
                                🏷️ {cat === "All" ? "All Categories" : cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={boardStyle}>
                    <Column title="Backlog / To Do" status="Pending" glowColor="#f59e0b" countColor="rgba(245, 158, 11, 0.15)" />
                    <Column title="In Active Scope" status="InProgress" glowColor="#3b82f6" countColor="rgba(59, 130, 246, 0.15)" />
                    <Column title="Completed Done" status="Completed" glowColor="#10b981" countColor="rgba(16, 185, 129, 0.15)" />
                </div>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;

// ==========================================
// PREMIUM MATTE DARK STYLES MAP
// ==========================================
const boardViewport = { width: "100%", padding: "20px", boxSizing: "border-box" };
const controlBarWrapper = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "24px", flexWrap: "wrap" };
const utilityGroup = { display: "flex", gap: "12px" };
const filterGroup = { display: "flex", gap: "12px", alignItems: "center" };
const boardStyle = { display: "flex", gap: "24px", alignItems: "flex-start", width: "100%", overflowX: "auto" };
const columnContainer = { flex: 1, minWidth: "290px", display: "flex", flexDirection: "column" };
const columnHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", padding: "0 4px" };
const headerDot = (color) => ({ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 8px ${color}` });
const columnTitleText = { margin: 0, fontSize: "14px", fontWeight: "600", color: "#f1f5f9", letterSpacing: "-0.2px" };
const counterBadge = (bgColor) => ({ fontSize: "11px", fontWeight: "700", color: "#cbd5e1", backgroundColor: bgColor, padding: "2px 8px", borderRadius: "12px" });
const columnStyle = { padding: "12px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.03)", minHeight: "650px", display: "flex", flexDirection: "column", gap: "12px", transition: "background-color 0.2s ease" };
const cardStyle = { padding: "16px", borderRadius: "10px", cursor: "grab", boxSizing: "border-box", userSelect: "none" };
const cardHeaderRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" };
const categoryTag = { fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" };
const highPriorityAlert = { fontSize: "10px", fontWeight: "600", color: "#f87171", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "2px 6px", borderRadius: "4px" };
const cardTitle = { margin: "0 0 6px 0", fontSize: "14px", fontWeight: "600", color: "#f8fafc", lineHeight: "1.4" };
const cardDesc = { margin: "0 0 14px 0", fontSize: "12px", color: "#64748b", lineHeight: "1.5" };
const cardFooterRow = { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.03)", paddingTop: "10px", marginTop: "auto" };
const assigneeWrapper = { display: "flex", alignItems: "center", gap: "8px" };
const avatarCircle = { width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(99, 102, 241, 0.2)" };
const assigneeName = { fontSize: "11px", fontWeight: "500", color: "#64748b" };