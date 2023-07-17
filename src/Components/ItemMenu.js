import React from 'react';
import './ItemMenu.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
export default function ItemMenu(props){
    return(
        <button className="btn" type="button" onClick={()=>{props.eventButton()}}>
            <FontAwesomeIcon className={props.class} icon={props.icon} />
        </button>
    );
}