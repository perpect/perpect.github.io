class UnitImgSet {
    constructor(defaultPromise, atkPromise, defensePromise, skillPromise){
        this.default = defaultPromise;
        this.atk = atkPromise;
        this.defense = defensePromise;
        this.skill = skillPromise;
    }

    load(){
        this.default.then((img)=>{
            this.default = img;
        });
        this.atk.then((img)=>{
            this.atk = img;
        });
        this.defense.then((img)=>{
            this.defense = img;
        });
        skill.forEach(s => {
            this.default.then((img)=>{
                this.default = img;
            });
        });
    }
}

class DataLoader {
    constructor(){
        this.loadImage("./img/").then(img, ()=>{
            
        })
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = (error) => reject(error);
        });
    }
}