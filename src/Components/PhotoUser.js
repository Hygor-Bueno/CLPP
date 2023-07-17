import React from "react"
import CovertBase64 from "../Base64/ConvertBase64";
import './PhotoUser.css'
import groupCLPP from '../Assets/Image/groupCLPP.png'

export default function PhotoUser(props) {
    return (
        <div className="PhotoUserClass" onClick={()=>props.logoff()}>
            <img id='PhotoUser' className="rounded-circle" src={pathPhoto()} alt={'Foto do colaborador'} />
            {/* <span className={`rounded-circle ${statusUser()}`}></span> */}
        </div>
    );
    function statusUser() {
        let response;
        if (props.status) {
            response = 'online';
        } else {
            response = 'offline';
        }
        return response;
    }
    function pathPhoto() {
        let response;
        const base64 = new CovertBase64(null);
        if (props.isGroup || !props.base64) {
            response = groupCLPP;
        } else if(props.base64){
            response = base64.convertImageURL(props.base64)
        }
        return response;
    }
}