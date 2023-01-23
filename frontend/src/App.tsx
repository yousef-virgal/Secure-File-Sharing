import React, { useEffect, useState } from 'react';
import { generateKey, encrypt, decrypt } from "js-crypto-rsa";
import CryptoJS from "crypto-js";
import arrayBufferToHex from "array-buffer-to-hex"

import { PuplicKey, PrivateKey, KeyPair, SymmetricKeys } from "./KeyInterface/KeyInterface"
import { FileInterface } from "./FileInterface/FileInterface";
import { ENCRYPTION_ALGORITHMS } from './EncryptionConstants/constants';
import FileContainer from './Components/FileContainer/FileContainer';
import UploadComponent from './Components/UploadComponent/uploadComponent';
import { FileProps } from "./Components/FileComponent/FileComponentInterface";

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [serverPublicKey, setServerPublicKey] = useState<PuplicKey>({});
  const [keys, setKeys] = useState<KeyPair>({});
  const [fileContent, setFileContent] = useState<FileInterface>({});
  const [symmetricKeys, setSymmetricKeys] = useState<SymmetricKeys>({});
  const [files, setFiles] = useState<FileProps[]>([]);

  // Fetching Server PublicKey
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}`)
      .then((response) => { return response.json() })
      .then((data) => { setServerPublicKey(data) })
  }, []);

  // Generate Client Keys
  useEffect(() => {
    generateKey(2048).then((key) => {
      setKeys({ publicKey: key.publicKey as PuplicKey, privateKey: key.privateKey as PrivateKey });
    })
  }, []);

  //fetch documents
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/documents`)
      .then((response) => { return response.json() })
      .then((data) => { setFiles(data as FileProps[]) })
  }, []);

  //Initial Values
  useEffect(() => {
    const AES_KEY_INT = new Uint32Array(8);
    const DES_KEY_INT = new Uint32Array(2);
    const MASTER_KEY_INT = new Uint32Array(2);

    const TRIPLE_DES_KEY_INT = new Uint32Array(6);
    const INTIAL_VALUE_INT = new Uint32Array(4);

    const AES_KEY_HEX: string[] = [];
    const INTIAL_VALUE_HEX: string[] = [];
    const DES_KEY_HEX: string[] = [];
    const TRIPLE_DES_KEY_HEX: string[] = [];
    const MASTER_KEY_HEX: string[] = [];

    window.crypto.getRandomValues(INTIAL_VALUE_INT);
    window.crypto.getRandomValues(AES_KEY_INT);
    window.crypto.getRandomValues(DES_KEY_INT);
    window.crypto.getRandomValues(TRIPLE_DES_KEY_INT);
    window.crypto.getRandomValues(MASTER_KEY_INT);

    INTIAL_VALUE_INT.forEach((el) => INTIAL_VALUE_HEX.push(el.toString(16)));
    AES_KEY_INT.forEach((el) => AES_KEY_HEX.push(el.toString(16)));
    DES_KEY_INT.forEach((el) => DES_KEY_HEX.push(el.toString(16)));
    TRIPLE_DES_KEY_INT.forEach((el) => TRIPLE_DES_KEY_HEX.push(el.toString(16)));
    MASTER_KEY_INT.forEach((el) => MASTER_KEY_HEX.push(el.toString(16)));


    setSymmetricKeys({
      IV: INTIAL_VALUE_HEX.join(""),
      AesKey: AES_KEY_HEX.join(""),
      DesKey: DES_KEY_HEX.join(""),
      TripleDesKey: TRIPLE_DES_KEY_HEX.join(""),
      masterKey: MASTER_KEY_HEX.join("")
    })
  }, [])

  const handleFileInput = (event: any) => {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function () {
      setFileContent({
        fileName: file.name,
        fileContent: reader.result as ArrayBuffer
      });
    };

    reader.onerror = function () {
      console.log(reader.error);
    };


  };

  const encryptKeys = (): string => {
    const keysToEncrypt = symmetricKeys.DesKey + "\n" + symmetricKeys.AesKey + "\n" + symmetricKeys.TripleDesKey + "0000000000"

    let masterKey = CryptoJS.enc.Hex.parse(symmetricKeys.masterKey as string);
    let iv = CryptoJS.enc.Hex.parse(symmetricKeys.IV as string);

    const encryptedKeys = CryptoJS.DES.encrypt(CryptoJS.enc.Latin1.parse(keysToEncrypt), masterKey, { iv: iv, padding: CryptoJS.pad.NoPadding });

    return encryptedKeys.toString();
  }


  const buttonHandler = (event: any) => {
    if (!fileContent.fileContent) {
      alert("No File Is Chosen");
      return;
    }

    let iv = CryptoJS.enc.Hex.parse(symmetricKeys.IV as string);
    let desKey = CryptoJS.enc.Hex.parse(symmetricKeys.DesKey as string);
    let aesKey = CryptoJS.enc.Hex.parse(symmetricKeys.AesKey as string);
    let tripleDesKey = CryptoJS.enc.Hex.parse(symmetricKeys.TripleDesKey as string);

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    let encryptionAlgo = ENCRYPTION_ALGORITHMS.DES;

    // const textBuffer = enc.encode(fileContent.fileContent).buffer;
    let fullEncrpyptedText = "";

    //split with constant 32 value
    for (let i = 0; i < fileContent.fileContent.byteLength; i += 32) {
      let currentString: any = "";

      if (i + 32 > fileContent.fileContent.byteLength) {
        let finalData = new Uint8Array(fileContent.fileContent.slice(i, fileContent.fileContent.byteLength));
        currentString = arrayBufferToHex(finalData);
      }
      else {
        currentString = arrayBufferToHex(new Uint8Array(fileContent.fileContent.slice(i, i + 32)));
      }

      switch (encryptionAlgo) {
        case ENCRYPTION_ALGORITHMS.DES:
          let encryptedDesText = CryptoJS.DES.encrypt(currentString, desKey, { iv: iv, padding: CryptoJS.pad.NoPadding });
          if (encryptedDesText.toString().length > 9)
            fullEncrpyptedText += encryptedDesText.toString().length + encryptedDesText.toString();
          else
            fullEncrpyptedText += "0" + encryptedDesText.toString().length + encryptedDesText.toString();

          encryptionAlgo = ENCRYPTION_ALGORITHMS.AES;
          break;

        case ENCRYPTION_ALGORITHMS.AES:
          let encryptedAesText = CryptoJS.AES.encrypt(currentString, aesKey, { iv: iv, padding: CryptoJS.pad.NoPadding });
          if (encryptedAesText.toString().length > 9)
            fullEncrpyptedText += encryptedAesText.toString().length + encryptedAesText.toString();
          else
            fullEncrpyptedText += "0" + encryptedAesText.toString().length + encryptedAesText.toString();

          encryptionAlgo = ENCRYPTION_ALGORITHMS.TRIPLE_DES;
          break;

        case ENCRYPTION_ALGORITHMS.TRIPLE_DES:
          let encryptedTripleDesText = CryptoJS.TripleDES.encrypt(currentString, tripleDesKey, { iv: iv, padding: CryptoJS.pad.NoPadding });

          if (encryptedTripleDesText.toString().length > 9)
            fullEncrpyptedText += encryptedTripleDesText.toString().length + encryptedTripleDesText.toString();
          else
            fullEncrpyptedText += "0" + encryptedTripleDesText.toString().length + encryptedTripleDesText.toString();

          encryptionAlgo = ENCRYPTION_ALGORITHMS.DES;
          break;
      }

    }

    const encryptedKeys = encryptKeys();

    encrypt(enc.encode(symmetricKeys.masterKey), serverPublicKey).then(async (result) => {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}`, {
        method: "POST", headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json',
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({
          file: fullEncrpyptedText,
          file_keys: encryptedKeys,
          masterKey: result,
          iv: await encrypt(enc.encode(symmetricKeys.IV), serverPublicKey),
          name: fileContent.fileName,
        }),
        cache: 'default'
      })
      window.location.reload();
    })
  };

  const fromHexString = (hexString: any) => {
    return Uint8Array.from(hexString.match(/.{1,2}/g).map((byte: any) => {
      return parseInt(byte, 16);
    }))
  }

  const decryptFile = (id: string) => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/documents/${id}`, {
      method: "POST",
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json',
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({
        key: keys.publicKey
      })
    })
      .then((response) => response.json())
      .then(async (data) => {
        const masterKey = new TextDecoder().decode(await decrypt(new Uint8Array(Object.values(data["master_key"])), keys.privateKey as JsonWebKey));
        const iv = new TextDecoder().decode(await decrypt(new Uint8Array(Object.values(data.iv)), keys.privateKey as JsonWebKey));

        const decryptedKeys = CryptoJS.DES.decrypt(data.keys, CryptoJS.enc.Hex.parse(masterKey as string), { iv: CryptoJS.enc.Hex.parse(iv as string), padding: CryptoJS.pad.NoPadding }).toString(CryptoJS.enc.Latin1);
        const [desKey, aesKey, tripleDesKey] = decryptedKeys.split("\n");

        const fileData: string = data.file;
        let i = 0;
        let decryptedText:number[] = [];
        let currentAlgo = ENCRYPTION_ALGORITHMS.DES;

        while (i < fileData.length) {
          let forwardLength: number = parseInt(fileData.slice(i, i + 2));
          switch (currentAlgo) {
            case ENCRYPTION_ALGORITHMS.DES:
              const desDec = CryptoJS.DES.decrypt(fileData.slice(i + 2, i + forwardLength + 2), CryptoJS.enc.Hex.parse(desKey as string), { iv: CryptoJS.enc.Hex.parse(iv as string), padding: CryptoJS.pad.NoPadding });
              decryptedText = decryptedText.concat(Array.from(fromHexString(new TextDecoder().decode(fromHexString(desDec.toString(CryptoJS.enc.Hex))))));
              currentAlgo = ENCRYPTION_ALGORITHMS.AES;
              break;

            case ENCRYPTION_ALGORITHMS.AES:
              const aesDec = CryptoJS.AES.decrypt(fileData.slice(i + 2, i + forwardLength + 2), CryptoJS.enc.Hex.parse(aesKey as string), { iv: CryptoJS.enc.Hex.parse(iv as string), padding: CryptoJS.pad.NoPadding });
              decryptedText = decryptedText.concat(Array.from(fromHexString(new TextDecoder().decode(fromHexString(aesDec.toString(CryptoJS.enc.Hex))))));
              currentAlgo = ENCRYPTION_ALGORITHMS.TRIPLE_DES;
              break;

            case ENCRYPTION_ALGORITHMS.TRIPLE_DES:
              const tripleDesDec = CryptoJS.TripleDES.decrypt(fileData.slice(i + 2, i + forwardLength + 2), CryptoJS.enc.Hex.parse(tripleDesKey.slice(0, tripleDesKey.length - 9) as string), { iv: CryptoJS.enc.Hex.parse(iv as string), padding: CryptoJS.pad.NoPadding });
              decryptedText = decryptedText.concat(Array.from(fromHexString(new TextDecoder().decode(fromHexString(tripleDesDec.toString(CryptoJS.enc.Hex))))));
              currentAlgo = ENCRYPTION_ALGORITHMS.DES;
              break;
          }
          i += forwardLength + 2;
        }
        downloadFile(data.fileName, decryptedText);
      });
  }

  const downloadFile = (filename: string, text: number[]) => {
    let element = document.createElement('a');
    const file = new Blob([new Uint8Array(text)]);
    element.href = URL.createObjectURL(file);
    element.download = filename;
    element.style.display = 'none';
    element.click();
    URL.revokeObjectURL(element.href);

  }

  return (
    <div className="App">
      <UploadComponent uploadButtonHandler={buttonHandler} fileHandler={handleFileInput} />
      <FileContainer fileHanlderFunction={decryptFile} Files={files} />
    </div>
  );
}

export default App;
