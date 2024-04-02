const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

//App setup
const app = express();
app.use(cors());

//Server Setup
const server = http.createServer(app);

//MongoDB setup
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const database = client.db("kommunication");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", async (roomId) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);

    const room = database.collection(roomId);
    const messages = await room.find().toArray();
    socket.emit("previous_messages", messages);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("recieve_message", data);

    const room = database.collection(data.room);
    room.insertOne(data);
  });
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server Running");
});
