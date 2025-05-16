// ScheduleTable.js
class Person {
    constructor(name, enlistmentDay) {
        this.name = name;
        this.enlistmentDay = enlistmentDay;
    }
    // TODO: Calculate Rank
}

class PeopleInfo {
    constructor(people) {
        this.people = people;
    }

    getPerson(idx) {
        return this.people[idx];
    }

    get length() {
        return this.people.length;
    }
    // TODO: Save & Load
}

class ScheduleCard {
    constructor(type, id, isChecked, mgr, iconSize = 16) {
        this.id = id;
        this.mgr = mgr;
        this.elem = document.createElement("div");
        this.elem.className = "scheduleCardBox";

        this.radioElem = document.createElement("input");
        this.radioElem.type = "radio";
        this.radioElem.name = type;
        this.radioElem.value = this.id;
        this.radioElem.id = `${type}Radio-${this.id}`;
        this.radioElem.checked = isChecked;
        this.radioElem.addEventListener("change", () => this.mgr.select(this.id));

        this.setMainLabel = document.createElement("label");
        this.setMainLabel.htmlFor = this.radioElem.id;
        this.icon = new Image(iconSize, iconSize);
        this.icon.src = "./icons/calendar.png";
        this.setMainLabel.appendChild(this.icon);

        this.copyBtn = document.createElement("div");
        this.copyBtn.className = "smallBtn";
        this.copyBtn.innerText = "복사";
        this.copyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.mgr.copy) this.mgr.copy(this.id);
        });

        this.deleteBtn = document.createElement("div");
        this.deleteBtn.className = "smallBtn";
        this.deleteBtn.innerText = "삭제";
        this.deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.mgr.remove) this.mgr.remove(this.id);
        });

        const controlRow = document.createElement("div");
        controlRow.className = "rowContent";
        controlRow.style.justifyContent = "space-between";
        controlRow.appendChild(this.copyBtn);
        controlRow.appendChild(this.deleteBtn);

        this.elem.appendChild(this.radioElem);
        this.elem.appendChild(this.setMainLabel);
        this.elem.appendChild(controlRow);
    }
}

class ScheduleTable {
    constructor(peopleInfo = null, dateInfo = null) {
        this.table = document.createElement("table");
        dateInfo.setMonth(dateInfo.getMonth() + 1);
        dateInfo.setDate(0);
        let dayLength = dateInfo.getDate();
        this.firstRow = this.table.insertRow();
        this.tableInfo = [[]];
        this.peopleInfo = peopleInfo;
        this.dateInfo = dateInfo;
        this.workData = [];
        dateInfo.setDate(1);
        let dateCalc = dateInfo.getDay();

        for (let i = 0; i < dayLength + 1; i++) {
            const dayCell = document.createElement('th');
            this.tableInfo[0].push(dayCell);
            this.firstRow.append(dayCell);
            if (i == 0) continue;
            dayCell.classList.add("dayCell");
            dayCell.insertAdjacentHTML("afterbegin", i);
            if (dateCalc == 0) dayCell.classList.add("SunColor");
            if (dateCalc == 6) dayCell.classList.add("SatColor");
            dateCalc = (dateCalc + 1) % 7;
        }

        for (let i = 1; i < peopleInfo.length + 1; i++) {
            this.tableInfo.push([]);
            this.workData.push(Array(dayLength).fill(''));
            const nowRow = this.table.insertRow();
            const personCell = nowRow.insertCell();
            personCell.insertAdjacentHTML("afterbegin", peopleInfo.getPerson(i - 1).name);
            personCell.classList.add("nameCell");
            nowRow.append(personCell);
            for (let j = 0; j < dayLength; j++) {
                const newCell = nowRow.insertCell();
                newCell.classList.add("dayCell");
                this.tableInfo[i].push(newCell);
            }
            this.table.append(nowRow);
        }
    }

    insertTo(parentElem) {
        parentElem.appendChild(this.table);
    }

    chageCell(peopleId, day, schedule) {
        this.tableInfo[peopleId + 1][day].classList.add(schedule + "Color");
    }
}

class ScheduleTableMgr {
    constructor(date) {
        this.scheduleTables = {};
        this.mainScheduleTable = {};
        this.date = new Date(date.getFullYear(), date.getMonth());
    }

    add(schedule, date = null, isMain = false) {
        if (date == null) date = this.date;
        const key = date.toString();
        if (this.scheduleTables[key]) {
            if (isMain) this.mainScheduleTable[key] = this.scheduleTables[key].length;
            this.scheduleTables[key].push(schedule);
        } else {
            this.scheduleTables[key] = [schedule];
            this.mainScheduleTable[key] = 0;
        }
    }

    get year() {
        return this.date.getFullYear();
    }

    get month() {
        return this.date.getMonth();
    }

    insertScheduleCards(parent) {
        // TODO: Implement if needed
    }

    getSchedule(date = null) {
        if (date == null) date = this.date;
        const key = date.toString();
        if (this.isValidDate(date))
            return this.scheduleTables[key][this.mainScheduleTable[key]];
        else return null;
    }

    setDate(date) {
        this.date.setFullYear(date.getFullYear());
        this.date.setMonth(date.getMonth());
    }

    prevMonth() {
        this.date.setMonth(this.date.getMonth() - 1);
    }

    nextMonth() {
        this.date.setMonth(this.date.getMonth() + 1);
    }

    isValidDate(date = null) {
        if (date == null) date = this.date;
        return date.toString() in this.scheduleTables;
    }

    update(table) {
        if (table.children[0]) table.removeChild(table.children[0]);
        const schedule = this.getSchedule(this.date);
        if (this.isValidDate()) schedule.insertTo(table);
    }
}
