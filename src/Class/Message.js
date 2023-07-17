export default class Message {
    id_user;
    message;
    notification; 
    type;

    constructor(id_user,message,notification,type) {
        this.id_user = id_user.toString();
        this.message = message;
        this.notification = notification.toString();
        this.type = type.toString();
    }

}