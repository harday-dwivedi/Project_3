//using chess.js, ejs and socket.io

const express = require("express");
const socket = require("socket.io");        //socket is used to connect realtime
const http = require("http");
const path = require("path");
const { Chess } = require("chess.js");

const app = express();

const server = http.createServer(app);
const io = socket(server);      //http server based on express

const chess = new Chess();
let players = {};
let currentplayer  = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/", (req,res) => {
    res.render("index");
});

io.on("connection", (socket) => {
    console.log("working");
    
    if(!players.white){
        players.white = socket.id;
        socket.emit("playerrole","w");
    }
    else if(!players.black){
        players.black = socket.id;
        socket.emit("playerrole","b");
    }
    else{
        socket.emit("spectatorrole");
    }

    socket.on("disconnect", ()=>{
        if(socket.id === players.white){
            delete players.white;
        }
        else if(socket.id === players.black){
            delete players.black;
        }
    });

    socket.on("move", (move) => {
        try{
            if(chess.turn() === 'w' && socket.id !== players.white){
                return;
            }
            if(chess.turn() === 'b' && socket.id !== players.black){
                return;
            }
            const result = chess.move(move);
            if(result){
                currentplayer = chess.turn();
                io.emit("move",move);
                io.emit("boardstate",chess.fen());
            }
        }
        catch(err){
            console.log(err);
            socket.emit("invalidmove  ",move);
        }
    })
});

server.listen(3000);
