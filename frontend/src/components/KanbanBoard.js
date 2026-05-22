import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const KanbanBoard = () => {
    const [tasks, setTasks] = useState([]);

    const token = localStorage.getItem("token");

    const fetchTasks = async () => {
        const res = await axios.get("http://localhost:5006/api/tasks", {
            headers: { Authorization: `Bearer ${token}` }
        });

        setTasks(res.data);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // =========================
    // HANDLE DRAG END
    // =========================
    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        const task = tasks.find(t => t.id.toString() === draggableId);

        const newStatus = destination.droppableId;

        // update UI instantly
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, status: newStatus } : t
        );

        setTasks(updatedTasks);

        // update backend
        try {
            await axios.put(
                `http://localhost:5006/api/tasks/${task.id}`,
                { ...task, status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (err) {
            console.log(err);
        }
    };

    const getTasksByStatus = (status) =>
        tasks.filter(t => t.status === status);

    const Column = ({ title, status, color }) => (
        <Droppable droppableId={status}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ ...columnStyle, borderTop: `4px solid ${color}` }}
                >
                    <h3>{title}</h3>

                    {getTasksByStatus(status).map((task, index) => (
                        <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                        >
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                        ...cardStyle,
                                        ...provided.draggableProps.style
                                    }}
                                >
                                    <h4>{task.title}</h4>
                                    <p>{task.description}</p>
                                </div>
                            )}
                        </Draggable>
                    ))}

                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={boardStyle}>
                <Column title="🟡 To Do" status="Pending" color="#f1c40f" />
                <Column title="🔵 In Progress" status="InProgress" color="#3498db" />
                <Column title="🟢 Done" status="Completed" color="#2ecc71" />
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;

// ========================= STYLES =========================
const boardStyle = {
    display: "flex",
    gap: "20px",
    padding: "20px"
};

const columnStyle = {
    flex: 1,
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "10px",
    minHeight: "500px"
};

const cardStyle = {
    background: "white",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
};