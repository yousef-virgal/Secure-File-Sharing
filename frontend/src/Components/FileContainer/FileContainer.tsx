import React from "react";
import {  Container, Row, Col } from "react-bootstrap";

import { FileContainerInterface } from "./FileContainerInterface";
import FileComponent from "../FileComponent/FileComponent";

import "./FileContainerStyles.css";

function FileContainer(fileContainerProps: FileContainerInterface) {

    const Files =  fileContainerProps.Files.map((file) => {
        return  <FileComponent key={file.id} id={file.id} name={file.name} onClickHandler={fileContainerProps.fileHanlderFunction}/>
    });

    return <Container fluid >
        <Row >
            {Files}
        </Row>
    </Container>
}

export default FileContainer;