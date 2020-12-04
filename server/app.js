const http = require("http");
const path = require("path");
const express = require("express");
const socketIO = require("socket.io");

const publicPath = path.join(__dirname, '/../client');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

server.listen(port, () =>{
console.log(`Listening on port ${port}`);
});

//list to store all connections
SOCKET_LIST = []; 

//Start a connection
io.sockets.on("connection", (socket) =>{
console.log("new player connected");

//add connection to list of connections
SOCKET_LIST.push(socket);
console.log(SOCKET_LIST.length);

//Initialize connection specific values
socket.x = 0;
socket.y = 0;
socket.color = getRandomColor();
socket.input = {};
socket.input.left= false;
socket.input.right = false;
socket.input.up = false;
socket.input.down = false;
socket.speed = 7;


//listens for input from connection
socket.on("input", (data) => {
socket.input = data;
});




//Handle disconnections
socket.on("disconnect", () => {
console.log("player disconnected");

//remove connection from list
for(i=0; i < SOCKET_LIST.length; i++){
    if(SOCKET_LIST[i].socket != socket){  
        SOCKET_LIST.splice(i, 1);
    }
}
});
});

//update function
setInterval(() => {
    var pack = [];
    for(var i in SOCKET_LIST){
        socket = SOCKET_LIST[i];
        if(socket.input.right){
            socket.x+=socket.speed;
        }
        if(socket.input.left){
            socket.x-=socket.speed;
        }
        if(socket.input.down){
            socket.y += socket.speed;
        }
        if(socket.input.up){
            socket.y -= socket.speed;
        }

        pack.push({
            x:socket.x,
            y:socket.y,
            color:socket.color
        });
    }

    io.emit("updatePosition", pack);
    io.emit("getInput");
}, 1000/25);

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }