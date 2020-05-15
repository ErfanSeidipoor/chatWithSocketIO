const express = require('express')
const path = require("path")
const http = require("http")
const socketio = require("socket.io") 
const formatMessage = require('./utils/message')
const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


io.use((socket, next) => {
    // console.log(socket)

    let token = socket.handshake.query.token;
    console.log("token > ", token)
    console.log("id > ", socket.id)
    
    
    let clientId = socket.handshake.headers['x-clientid'];
    console.log("clientId > ", clientId)


    // return next();

});


io.on('connection', socket => {

    socket.on('joinRoom', ({username, room})=>{
        
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        socket.emit('message', formatMessage('chat Bot', `${user.username} Welcome To Room`))

        socket.broadcast.to(user.room).emit('message',formatMessage('chat Bot', `${user.username}  has joined to chat`))


        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on('chatMessage', message => {
        const user = getCurrentUser(socket.id)
        console.log(message)
        console.log(user.room)
        
        io.to(user.room).emit('message', formatMessage(user.username, message))

    })

    socket.on('disconnect', ()=>{
        const user = userLeaves(socket.id)

        if (user) {
            io.to(user.room).emit('message', formatMessage('chat Bot', `${user.username} Has Left The Chat`))
            
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})



app.use(express.static(path.join(__dirname, 'public')))
const port = 4000 || process.env.port

server.listen(port, ()=>console.log(`server running on ${port}`))