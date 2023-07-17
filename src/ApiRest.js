import IndexedDB from "./IndexedDB/indexedDB";

export class Connection {
    #URL;
    #params;
    #pathFile;
    #err = false;

    async get(params, pathFile, err) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=7&AUTH=`, params)
        let req;
        await fetch(this.#URL, {
            method: 'GET'
        }).then(response => response.json()) 
            .then(body => {
                if (body.error) throw new Error(body.message)
                req = body;
            }).catch(messageErr => {
                req = this.prepareCatchReturn(messageErr);
            })
        this.cleanParams();
        return req;
    }

    async post(params, pathFile, err) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=7&AUTH=`)
        let req;
        await fetch(this.#URL, {
            method: 'POST',
            body: JSON.stringify(this.#params)
        }).then(response => response.json())
            .then(body => {
                if (body.error) throw Error(body.message);
                req = body;
            }).catch(messageErr => {
                req = this.prepareCatchReturn(messageErr);
            })
        this.cleanParams();
        return req;
    }

    async postLogin(params, pathFile, err) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=7&login=&AUTH=`)
        let req;
        await fetch(this.#URL, {
            method: 'POST',
            body: JSON.stringify(this.#params)
        }).then(response => response.json())
            .then(body => {
                if (body.error) throw Error(body.message);
                req = body;
            }).catch(messageErr => {
                req = this.prepareCatchReturn(messageErr);
            })
        this.cleanParams();
        return req;
    }

    async put(params, pathFile, err) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=7&AUTH=`)
        let req;
        await fetch(this.#URL, {
            method: 'PUT',
            body: JSON.stringify(this.#params)
        }).then(response => response.json())
            .then(body => {
                if (body.error) throw Error(body.message)
                req = body;
            }).catch(messageErr => {
                req = this.prepareCatchReturn(messageErr);
            })
        this.cleanParams();
        return req;
    }

    async putDefaltPassw(params, pathFile, err) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=7&login=&AUTH=`)
        let req;
        await fetch(this.#URL, {
            method: 'PUT',
            body: JSON.stringify(this.#params)
        }).then(response => response.json())
            .then(body => {
                if (body.error) throw Error(body.message)
                req = body;
            }).catch(messageErr => {
                req = this.prepareCatchReturn(messageErr);
            })
        this.cleanParams();
        return req;
    }
    async delete(params, pathFile, err) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=7&AUTH=`);
        let req;
        await fetch(this.#URL, {
            method: "DELETE",
            body: JSON.stringify(this.#params)
        }).then((response) => response.json())
            .then((body) => {
                if (body.error) throw Error(body.message);
                req = body;
            }).catch((messageErr) => {
                req = this.prepareCatchReturn(messageErr);
            });
        this.cleanParams();
        return req;
    }
    validationParams(params, pathFile, err) {
        if (params) this.#params = params;
        if (pathFile) this.#pathFile = pathFile;
        if (err) this.#err = err;
    }
    cleanParams() {
        this.#params = "";
        this.#pathFile = "";
        this.#err = false;
    }
    async settingUrl(middlewer, params) {
        let server = "http://192.168.0.99:71/GLOBAL";
        // let server = "http://187.35.128.157:71/GLOBAL";
        // let server = "http://187.92.74.154:71/GLOBAL";
        let token = await this.getToken() || localStorage.getItem("token");
        this.#URL = server + middlewer + token + (params ? params : "");
    }
    async getToken() {
        let result;
        let clpp = new IndexedDB();
        let user = await clpp.readObject(parseInt(localStorage.id_clpp) || 0);
        if(user) result = user.session;
        return result;
    }
    prepareCatchReturn(messageErr) {
        return { "error": true, "message": messageErr["message"] }
    }
}