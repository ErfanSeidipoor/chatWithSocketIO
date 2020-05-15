

const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')

const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
console.log({username, room});


const socket = io('http://localhost:4000?token=abc',{
    transportOptions: {
      polling: {
        extraHeaders: {
          'x-clientid': 'xabc'
        }
      }
    }
  })


socket.emit('joinRoom', {username, room})

socket.on('roomUsers', ({room,users})=>{
    outputRoomName(room)
    outputUsers(users)
})

socket.on('message',message=>{    
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', e=>{
    e.preventDefault()

    const msg = e.target.elements.msg

    socket.emit('chatMessage', msg.value)
    msg.value = ""
})


const outputMessage = (message) =>{
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta">${message.username}<span>  ${message.time}</span></p>
    <p class="text">${message.message}</p>
    `

    document.querySelector('.chat-messages').appendChild(div)
}


const outputRoomName = (room)=>{
    roomName.innerText = room
}

const outputUsers = (users)=> {
    usersList.innerHTML = `
        ${users.map(user=>`<li>${user.username}</li>`).join("")}
    `
}