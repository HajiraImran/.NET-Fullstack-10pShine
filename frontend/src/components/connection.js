import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5006/taskHub")
    .withAutomaticReconnect()
    .build();

export default connection;