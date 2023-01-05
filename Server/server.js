const express = require("express");
const crypto = require("crypto");
require('dotenv').config()

const app = express();
const port = process.env.PORT || 8080

let serverPublicKey = "";
let serverPrivateKey = "";


app.get("/", (req, res) => {
    res.send(serverPublicKey)
})


app.listen(port,()=>{
    console.log(`Server Started at port ${port}`);
    console.log("Generating the keys");
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });
    serverPublicKey = publicKey.export({format:"pem",type:"pkcs1"});
    serverPrivateKey = privateKey;
})