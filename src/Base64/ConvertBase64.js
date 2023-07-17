export default class CovertBase64 {
    photo;
    constructor(photo) {
        this.photo = photo
    }
    convert() {
        let response;
        let src = "data:image/jpeg;base64,"
        src += this.photo;
        if (this.photo) {
            let image = document.createElement('img');
            image.src = src;
            response = image;
        } else {
            let imgVazia = document.createElement('img');
            imgVazia.src = "./assets/images/user.png";
            response = imgVazia;
        }
        console.log(response);
        return response;
    }
    convertImageURL(base64){
        return `data:image/jpeg;base64,${base64}`    
    }
}