import React from "react";
import './InputField.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function InputField(props){
    return(
        <div className="d-flex flex-column divInputField" >
            <label>{props.icon && <FontAwesomeIcon className={props.iconStyle && props.iconStyle} icon={props.icon}/>} <b>{props.label}:</b></label>
            <input className="form-control"
                data-mandatory={props.mandatory ? '1':'0'} 
                disabled={props.disabledInput} 
                type={props.typeInput} 
                value={props.valueInput} 
                placeholder={props.placeholderInput && props.placeholderInput}
                onChange={(element)=>{props.setValue(element.target.value)}}
                onBlur={element=>{if(props.AssistentFunc) props.AssistentFunc(element)}}
            />
        </div>
    )
}