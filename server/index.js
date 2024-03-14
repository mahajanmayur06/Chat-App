import express from "express"
import { Server } from "socket.io"
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500

const app = express()

app.use(express.static(path.join(__dirname, "public")))

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)
    // upon connection - this message will show only to the user
    socket.emit('message', "Welcome to chat app")

    // upon connection - this message will show to everyone except user
    socket.broadcast.emit('message', `${socket.id.substring(0, 5)} connnected`)

    // Listening for a message event 
    socket.on('message', data => {
        console.log(data)
        // this message will go to everyone conectet to the server
        io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
    })

    // listening for disconnecting event - to all users
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
    })

    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name)
    })
})

io.on('error', error => {
    console.error('Socket ID: ', error);
});