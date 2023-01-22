import React from "react";
import { generate } from "geopattern"
import { FileProps } from "./FileComponentInterface";

import "./FileStyles.css";
import Col from "react-bootstrap/esm/Col";

function FileComponent(fileProps: FileProps) {
    return (
        <Col className="File">
            <div style={{width:"100%", height:"100%"}} onClick={() => fileProps.onClickHandler(fileProps.id)}>
                <div dangerouslySetInnerHTML={{ __html: generate(fileProps.id).toSvg() }} className="FileImage" />
                <h3 className="FileText">
                    {fileProps.name}
                </h3>
            </div>
        </Col>
    );
}


export default FileComponent