const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require("socket.io")
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');


const token = '7352657896:AAGTchr9t90beofDgT5Dg_XZFQ7VcVVN1xU';

const YOUR_CHAT_ID = '5110477383';

let bot ;
const app = express();
app.use(express.json()); 
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



function gracefulShutdown() {
    console.log('Shutting down gracefully...');
    if (bot) {
        bot.stopPolling();
    }
}

function initBot() {
    if (bot) {
        bot.stopPolling();
    }
    bot = new TelegramBot(token, { polling: true });
    bot.on('polling_error', (error) => {
        console.error('Polling error:');
        // Wait for a bit before trying to reconnect
        setTimeout(initBot, 5000);
    });

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        if (chatId.toString() === YOUR_CHAT_ID) {
            console.log('Received message from Telegram:', msg.text);
            // Broadcast the message to all connected clients
            io.to('chinmay').emit('chinmay-msg', msg.text);
        }
    });
}


//socket io connections routes
var msga = ""
io.on('connection', (client) => {
    console.log('a user connected to server : ', client.id);
    
    client.on("disconnect", () => {
        console.log("User Disconnected : ", client.id);
        gracefulShutdown();
        client.disconnect(true);

    })

    client.on('join-room',(msg)=>{
        console.log("join room : ",msg);
        client.join('chinmay');
    })
    let flag = false;
    client.on('user-msg', (data) => {
        initBot();
        console.log("User Msg Revived --> ", data)
        if (!flag) {
        client.emit('replay','Waiting for chinmay to join chat');
        flag=true;
        }
        client.join('chinmay');
        bot.sendMessage(YOUR_CHAT_ID, data).then(() => {
            console.log('Message sent to Telegram');
        }).catch((error) => {
            console.error('Error sending message to Telegram:', error);
        });
        client.to('chinmay').emit('user-msg',data);
    })

    client.on('contact-me',(msg)=>{
        initBot();
        bot.sendMessage(YOUR_CHAT_ID, msg).then(() => {
            console.log('Message sent to Telegram');
        }).catch((error) => {
            console.error('Error sending message to Telegram:', error);
        });
        gracefulShutdown();
        
    })

    client.on('chinmay-msg',(msg)=>{
        console.log("chinmay msg --> ",msg);
        client.to('chinmay').emit('chinmay-msg',msg);
    })
   

});



// const bot = new TelegramBot(token, { polling: true });



app.get('/', (req, res) => {
    res.sendFile("/public/index.html")
})



app.get('/refresh', (req, res) => {
    console.log(`Request Recived For Refresh on ${Date.now().toLocaleString()}`);
    res.status(200).send("Refreshed")
})





server.listen(8000, () => {
    console.log("Server Started At Port 8000")
})

