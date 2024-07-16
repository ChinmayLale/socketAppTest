const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require("socket.io")
const cors = require('cors');

const app = express();
app.use(express.static(path.resolve("./public")))
app.use(cors({
    origin: '*',
    credentials: true
}));



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});




//socket io connections routes
var msga = ""
io.on('connection', (client) => {
    console.log('a user connected to server : ', client.id);

    client.on("disconnect", () => {
        console.log("User Disconnected : ", client.id);
        client.disconnect(true);
    })

    client.on('join-room',(msg)=>{
        console.log("join room : ",msg);
        client.join('chinmay');
    })

    client.on('user-msg', (data) => {
        console.log("User Msg Revived --> ", data)
        client.emit('replay','Waiting for chinmay to join chat');
        client.join('chinmay')
        client.to('chinmay').emit('user-msg',data);
    })

    client.on('chinmay-msg',(msg)=>{
        console.log("chinmay msg --> ",msg);
        client.to('chinmay').emit('chinmay-msg',msg);
    })
   

});







app.get('/', (req, res) => {
    res.sendFile("/public/index.html")
})


server.listen(8000, () => {
    console.log("Server Started At Port 8000")
})

