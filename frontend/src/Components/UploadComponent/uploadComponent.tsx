import React from "react";
import Button from 'react-bootstrap/Button';

import { UploadComponentProps } from "./uploadComponantInterface";

import "./uploadComponentStyle.css"

function UploadComponent(props: UploadComponentProps) {
    return (
        <div>
            <label className="drop-container">
                <span className="drop-title">Choose files here</span>
                <input type="file" onChange={props.fileHandler} />
                <Button variant="outline-primary" size="lg" onClick={props.uploadButtonHandler}>Upload File</Button>{' '}
            </label>
        </div>
    );
}

export default UploadComponent;