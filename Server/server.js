const express = require("express");
const crypto = require("crypto");
const jsRsa = require("js-crypto-rsa");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const firebaseConfig = require("./firebaseConfig");
const { response } = require("express");
require("dotenv").config();

const app = express(); 
app.use(bodyParser.json({limit:"5000mb"})); 

const jsonParser = bodyParser.json();
app.use(cors());
const port = process.env.PORT || 8080;
  
let serverPublicKey = "";
let serverPrivateKey = "";

const firebase = initializeApp(firebaseConfig);
const firebaseDB = getFirestore(firebase);

app.get("/", (req, res) => {
  res.send(serverPublicKey);
});

app.post("/", jsonParser, (req, res) => {
  const decryptedData = crypto.privateDecrypt(
    {
      key: serverPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    new Uint8Array(Object.values(req.body.masterKey))
  );

  const decryptedIV = crypto.privateDecrypt(
    {
      key: serverPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    new Uint8Array(Object.values(req.body.iv))
  );

  const decryptedMasterKey = decryptedData.toString("ascii");
  const decryptedIVString = decryptedIV.toString("ascii");

  //Save Data to database
  const docRef = firebaseDB.collection("documents").doc();
  docRef.set({
    file: req.body.file,
    keys: req.body.file_keys,
    master_key: decryptedMasterKey,  
    id: docRef.id,
    iv: decryptedIVString,
    fileName: req.body.name  
  });
  res.sendStatus(200);
});

app.get("/documents", async (req, res) => {
  const snapshot = await firebaseDB.collection("documents").get();
  docList = [];  
  snapshot.forEach((doc) => {
    docList.push({id:doc.id, name: doc.data().fileName});
  });
  res.send(docList)
});

app.post("/documents/:docId", jsonParser ,async(req, res) => {
  const snapshot = await firebaseDB.collection("documents").doc(req.params.docId).get();
  const masterKey = await jsRsa.encrypt(new TextEncoder().encode(snapshot.data()["master_key"]), req.body.key);
  const iv = await jsRsa.encrypt(new TextEncoder().encode(snapshot.data().iv), req.body.key);
  res.send({...snapshot.data(), "master_key": masterKey, "iv": iv});
});

app.listen(port, () => {
  console.log(`Server Started at port ${port}`);

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  serverPublicKey = publicKey.export({ format: "jwk", type: "pkcs1" });
  serverPrivateKey = privateKey.export({ format: "pem", type: "pkcs1" });
});
