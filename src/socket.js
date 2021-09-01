import { app } from "./server.js"

import { Server } from "socket.io"

const io = new Server(app, { allowEIO3: true })

io.on("connection", (socket) => {
  console.log(socket.id)

  //Emits to this client.
  //socket.emit("newLogin")

  //Emit to everyone, including this client
  // io.sockets.emit("alive", "the server is alive")

  socket.on("login", ({ username, room }) => {
    onlineUsers.push({ username, id: socket.id, room })

    socket.join(room)
    console.log(socket.rooms)

    // Emits to everyone excluding this client
    socket.broadcast.emit("newLogin")
    socket.emit("loggedin")
  })

  socket.on("sendmessage", ({ message, room }) => {
    socket.to(room).emit("message", message)
  })

  socket.on("disconnect", () => {
    console.log("socket disconnected")
    onlineUsers = onlineUsers.filter((user) => user.id !== socket.id)
  })
})
