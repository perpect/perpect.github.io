class ScheduleButton {
    constructor(id, name, selected, mgr) {
        this.id = id;
        this.name = name;
        this.mgr = mgr;
        this.button = document.createElement("div");
        this.button.classList.add("scheduleButton");
        this.button.classList.add(id + "Color");
        this.selected = selected;
        if (this.selected)
            this.button.classList.add("selectedScheduleBtn");
        this.button.addEventListener("click", (e)=>{
            this.click();
        });
        this.button.insertAdjacentHTML("afterbegin", name);
    }

    click(){
        if (this.selected)
            return;
        this.button.classList.add("selectedScheduleBtn");
        this.mgr.selectBtn(this.id);
    }

    off(){
        this.button.classList.remove("selectedScheduleBtn");
        this.selected = false;
    }
}

// TODO : 라디오 버튼과 동일한 효과를 구현했는데 라디오 버튼으로 바꾸는 것도 고려해볼 것
class ScheduleController{
    constructor(initialSelect, scheduleTypeData) {
        this.scheduleTypeData = scheduleTypeData;
        this.scheduleButtons = {};
        this.nowId = initialSelect;
        scheduleTypeData.forEach(data => {
            this.scheduleButtons[data[0]] = new ScheduleButton(data[0], data[1], initialSelect == data[0], this);
        });
        this.selectedBtn = this.scheduleButtons[initialSelect];
        Object.keys(this.scheduleButtons).forEach((id)=>{
            if (this.nowId != id)
                this.scheduleButtons[id].off();
        });
    }

    selectBtn(id){
        if (this.nowId == id)
            return;
        this.selectedBtn.off();
        this.selectedBtn = this.scheduleButtons[id];
        this.nowId = id;
    }

    get keys(){
        return Object.keys(this.scheduleButtons);
    }

    insertTo(parent){
        Object.keys(this.scheduleButtons).forEach(id => {
            parent.appendChild(this.scheduleButtons[id].button);
        });
    }
}