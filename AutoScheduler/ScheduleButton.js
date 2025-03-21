class ScheduleButton {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.elem = document.createElement("div");
        this.elem.classList.add("scheduleButton");
        this.elem.classList.add(id + "Color");
        this.elem.addEventListener("click", (e)=>{
            console.log(name);
        });
        this.elem.insertAdjacentHTML("afterbegin", name);
    }
}

class ScheduleButtonController{
    constructor(btnData) {
        this.btnData = btnData;
        this.scheduleButtons = [];
        Object.keys(btnData).forEach(id => {
            this.scheduleButtons.push(new ScheduleButton(id, btnData[id]));
        });
    }

    get keys(){
        return Object.keys(this.scheduleButtons);
    }

    insertTo(parent){
        this.scheduleButtons.forEach(button => {
            parent.appendChild(button.elem);
        });
    }
}