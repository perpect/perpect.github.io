// ScheduleButton.js (리팩터링: 객체 기반 scheduleTypeData 대응)
class ScheduleButton {
    constructor(typeObj, selected, mgr) {
        this.id = typeObj.id;
        this.name = typeObj.name;
        this.color = typeObj.color;
        this.mgr = mgr;
        this.selected = selected;

        this.button = document.createElement("div");
        this.button.classList.add("scheduleButton");
        this.button.textContent = this.name;
        this.button.style.backgroundColor = this.color;

        if (this.selected)
            this.button.classList.add("selectedScheduleBtn");

        this.button.addEventListener("click", () => this.click());
    }

    click() {
        if (this.selected) return;
        this.button.classList.add("selectedScheduleBtn");
        this.mgr.selectBtn(this.id);
    }

    off() {
        this.button.classList.remove("selectedScheduleBtn");
        this.selected = false;
    }
}

class ScheduleController {
    constructor(initialSelect, scheduleTypeData) {
        this.scheduleTypeData = scheduleTypeData;
        this.scheduleButtons = {};
        this.nowId = initialSelect;

        scheduleTypeData.forEach(typeObj => {
            this.scheduleButtons[typeObj.id] = new ScheduleButton(typeObj, initialSelect === typeObj.id, this);
        });

        this.selectedBtn = this.scheduleButtons[initialSelect];
        Object.keys(this.scheduleButtons).forEach(id => {
            if (this.nowId !== id) this.scheduleButtons[id].off();
        });
    }

    selectBtn(id) {
        if (this.nowId === id) return;
        this.selectedBtn.off();
        this.selectedBtn = this.scheduleButtons[id];
        this.nowId = id;
    }

    get keys() {
        return Object.keys(this.scheduleButtons);
    }

    insertTo(parent) {
        Object.values(this.scheduleButtons).forEach(button => {
            parent.appendChild(button.button);
        });
    }
}