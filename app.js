const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://127.0.0.1:5500", // Allow Live Server's default port
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.join("broadcast");

  socket.emit("message", "Welcome to the chat");

  // Announce to others that someone joined
  socket
    .to("broadcast")
    .emit("chat message", `${socket.id} has joined the chat`);

  socket.on("disconnect", () => {
    console.log("User disconnected");
    socket
      .to("broadcast")
      .emit("chat message", `${socket.id} has left the chat`);
  });

  socket.on("chat message", (msg) => {
    // Broadcast the message to all other clients
    socket.broadcast.emit("chat message", msg);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
