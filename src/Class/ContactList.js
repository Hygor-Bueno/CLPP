import { Connection } from "../ApiRest";
import User from "./User";

export default class ContactList {
    #connection = new Connection();
    contacts = [];
    #idUser;
    constructor(id) {
        this.#idUser = id;
    }
    async loadListContacts() {
        try {
            let listFull = await this.#connection.get(`&application_id=7&web`, 'CCPP/UserAccess.php');
            if (listFull.error && !listFull.message.includes('No data')) throw new Error(listFull.message);
            this.contacts = await this.loadInfo(listFull.data);
            let list = await this.#connection.get(`&id=${this.#idUser}&id_user`, 'CLPP/Message.php');
            if (list.error) throw new Error(list.message);
            this.checkYouContacts(list.data)
        } catch (error) {
            console.log(error);
        }
    }
    async loadInfo(list) {
        const promises = list.map(async item => {
            const user = new User(item.id);
            await user.loadInfo();
            return user;
        });
        const results = await Promise.all(promises);
        return results;
    }

    checkYouContacts(list) {
        list.forEach(item => {
            if (item.id_user) {
                this.contacts.forEach(contact => {
                    if (parseInt(contact.id) === parseInt(item.id_user)) {
                        contact.youContact = 1;
                        contact.notification = item.notification;
                    }
                });
            }
        });
    }

    changeYouListContact(id) {
        this.contacts.forEach(contact => {
            if (parseInt(contact.id) === parseInt(id)) {
                contact.youContact = 1;
            }
        });
    }
}