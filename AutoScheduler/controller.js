class ScheduleButton {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.elem = document.createElement("div");
        this.elem.classList.add("scheduleButton");
        this.elem.classList.add(id + "Color");
        this.elem.addEventListener("click", (e)=>{
            console.log(e);
        });
    }
    
}

class ScheduleButtonController{
    constructor(scheduleButtons) {
        this.scheduleButtons = scheduleButtons;
    }

    insertTo(parent){
        this.scheduleButtons.keys.forEach(button => {
            parent.appendChild(button.elem);
        });
    }
}