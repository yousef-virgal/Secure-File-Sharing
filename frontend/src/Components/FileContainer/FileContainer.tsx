import React from "react";
import { Container, Row, Col } from "react-bootstrap";

import { FileContainerInterface } from "./FileContainerInterface";
import FileComponent from "../FileComponent/FileComponent";

import "./FileContainerStyles.css";

function FileContainer(fileContainerProps: FileContainerInterface) {

    const Files = fileContainerProps.Files.map((file) => {
        return <Col key={file.id} xs="12" sm="6" md="3"> <FileComponent key={file.id} id={file.id} name={file.name} onClickHandler={fileContainerProps.fileHanlderFunction} /> </Col>
    });

    return <Container fluid style={{padding:"0", width:"100%"}}>
        <Row style={{margin:"0",width:"100%" }}>
            {Files}
        </Row>
    </Container>
}

export default FileContainer;