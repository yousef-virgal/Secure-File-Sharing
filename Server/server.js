const express = require("express");
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config()

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 8080
const url = process.env.URL


app.get("/", (req, res) => {
    res.send("Hello world")
})

io.on("connection", (socket) => {
    console.log("Connection")
})

server.listen(port,()=>{
    console.log(`Server Started at port ${port}`);
})