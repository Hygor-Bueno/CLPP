import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import './Modal.css'

export default function Modal(props) {
    if (props.show) {
        return (
            <div id='divModalGAPP' onClick={() => { !props.confirm && close() }}>
                <Alert id="ModalGAPP" className="position-relative" variant={props.type} onClose={() => {!props.confirm && props.setShow(false)}} dismissible={!props.confirm?!props.noClose:props.noClose}>
                    <Alert.Heading>{props.title}</Alert.Heading>
                    <p>{props.message}</p>
                    {
                        props.confirm &&
                        <div className="d-flex justify-content-around">
                            <button className="btn btn-success" title="Sim" type="button" onClick={() =>props.funcConfirm()}>Sim</button>
                            <button className="btn btn-danger" title="Não" type="button" onClick={()=>props.setShow(false)}>Não</button>
                        </div>
                    }
                </Alert>
            </div>
        );
        function close() {
            if (!props.noClose) {
                props.setShow(false);
            }
        }
    }

}