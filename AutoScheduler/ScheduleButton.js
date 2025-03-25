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

class ScheduleController{
    constructor(scheduleTypeData) {
        this.scheduleTypeData = scheduleTypeData;
        this.scheduleButtons = [];
        scheduleTypeData.forEach(data => {
            this.scheduleButtons.push(new ScheduleButton(data[0], data[1]));
        });
    }

    get keys(){
        return Object.keys(this.scheduleButtons);
    }

    insertBtnTo(parent){
        this.scheduleButtons.forEach(button => {
            parent.appendChild(button.elem);
        });
    }
}