import { Connection } from "../ApiRest";

export default class User {
    #connection = new Connection();
    id;
    name;
    company;
    shop;
    departament;
    sub;
    CSDS;
    photo;
    administrator;
    youContact = 0;
    pendingMessage = 0;
    notification = 0;

    constructor(id, dataUser) {
        this.id = id;
        id && this.loadInfo();
        dataUser && this.populate(dataUser);
    }

    populate(dataUser) {
        this.id= dataUser.id;
        this.name= dataUser.name;
        this.company= dataUser.company;
        this.shop= dataUser.shop;
        this.departament= dataUser.departament;
        this.sub= dataUser.sub;
        this.CSDS= dataUser.CSDS;
        this.photo= dataUser.photo;
        this.administrator= dataUser.administrator;
        this.youContact = dataUser.youContact;
        this.pendingMessage = dataUser.pendingMessage;
        this.notification = dataUser.notification;
    }

    async loadInfo() {
        await this.loadPhotos();
        await this.loadDetails();
    }

    async loadPhotos() {
        try {
            let userPhoto = await this.#connection.get(`&id=${this.id}`, 'CCPP/EmployeePhoto.php');
            if (userPhoto.error && !userPhoto.message.includes('No data')) {
                throw new Error(userPhoto.message);
            } else if (!userPhoto.message) {
                this.photo = userPhoto.photo;
            }
        } catch (error) {
            console.log(error.toString());
        }
    }
    async loadDetails() {
        try {
            let details = await this.#connection.get(`&id=${this.id}`, 'CCPP/Employee.php');
            if (details.error && !details.message.includes('No data')) throw new Error(details.message);
            this.name = details.data[0]["name"];
            this.company = details.data[0]["company"];
            this.shop = details.data[0]["shop"];
            this.departament = details.data[0]["departament"];
            this.sub = details.data[0]["sub"];
            this.CSDS = details.data[0]["CSDS"];
            this.administrator = details.data[1]["administrator"];
        } catch (error) {
            console.log(error.toString());
        }
    }
}