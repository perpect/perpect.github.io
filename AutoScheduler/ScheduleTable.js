class Person {
    constructor(name, enlistmentDay) {
        this.name = name;
        this.enlistmentDay = enlistmentDay;
    }
    
    // TODO : Calculate Rank
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
    // TODO : Save & Load
}

class ScheduleCard {
    constructor(type, id, isChecked, mgr, iconSize) {
        this.id = id;
        this.mgr = mgr;
        this.elem = document.createElement("div");

        this.btnCollection = document.createElement("div");
        this.btnCollection.classList.add("rowContent");

        this.radioElem = document.createElement("input");
        this.radioElem.type = "radio";
        this.radioElem.name = type;
        this.radioElem.value = this.id;
        this.radioElem.id = type + "Radio-" + this.id;
        this.radioElem.checked = isChecked;
        this.radioElem.addEventListener("change", (e) => {
			this.mgr.select(this.id);
        });

        this.setMainLabel = document.createElement("label");
        this.icon = new Image(iconSize, iconSize);
        this.icon.src = "./icons/" + this.iconName + ".png";
        this.setMainLabel.appendChild(this.icon);
        this.setMainLabel.htmlFor = type + "Radio-" + this.id;

        this.copyBtn = document.createElement("div");
        this.deleteBtn = document.createElement("div");
        
        this.elem.appendChild();
        this.elem
    }
}

class ScheduleTable {
    constructor(peopleInfo = None, dateInfo = None) {
        this.table = document.createElement("table");
        dateInfo.setMonth(dateInfo.getMonth() + 1);
        dateInfo.setDate(0);
        let dayLength = dateInfo.getDate();
        this.firstRow = this.table.insertRow();
        this.tableInfo = [[]];
        console.log(dateInfo);
        dateInfo.setDate(1);
        let dateCalc = dateInfo.getDay();
        for (let i = 0; i < dayLength + 1; i++) {
            const dayCell = document.createElement('th');
            this.tableInfo[0].push(dayCell);
            this.firstRow.append(dayCell);

            if (i == 0) continue;
            dayCell.classList.add("dayCell");
            dayCell.insertAdjacentHTML("afterbegin", i);
            if (dateCalc == 0)
                dayCell.classList.add("SunColor");
            if (dateCalc == 6)
                dayCell.classList.add("SatColor");
            dateCalc = (dateCalc + 1) % 7;
        }

        for (let i = 1; i < peopleInfo.length + 1; i++) {
            this.tableInfo.push([]);
            const nowRow = this.table.insertRow();
            const personCell = nowRow.insertCell();
            personCell.insertAdjacentHTML("afterbegin", peopleInfo.getPerson(i - 1).name);
            personCell.classList.add("nameCell");
            nowRow.append(personCell);
            for (let j = 0; j < dayLength; j++) {
                const newCell = nowRow.insertCell();
                nowRow.append(newCell);
                newCell.classList.add("dayCell");
                this.tableInfo[i].push(newCell);
            }
            this.table.append(nowRow);
        }
    }

    insertTo(parentElem){
        parentElem.appendChild(this.table);
    }

    chageCell(peopleId, day, schedule){
        this.tableInfo[peopleId + 1][day].classList.add(schedule + "Color");
    }
}

class ScheduleTableMgr{
    constructor(date){
        this.scheduleTables = {};
        this.mainScheduleTable = {};
        this.date = new Date(date.getFullYear(), date.getMonth());
    }

    add(schedule, date = null, isMain = false){
        if (date == null)
            date = this.date;
        else {
            date.setMonth(date.getMonth());
            date.setFullYear(date.getFullYear());
        }
        if (date in this.scheduleTables) {
            if (isMain)
                this.mainScheduleTable[date] = this.scheduleTables[date].length;
            this.scheduleTables[date].push(schedule);
        } else {
            this.scheduleTables[date] = [schedule];
            this.mainScheduleTable[date] = 0;
        }
    }

    get year(){
        return this.date.getFullYear();
    }

    get month(){
        return this.date.getMonth();
    }

    insertScheduleCards(parent){
        parent.appendChild();
    }

    getSchedule(date = null){
        if (date == null)
            date = this.date;
        if (this.isValidDate(date))
            return this.scheduleTables[date][this.mainScheduleTable[date]];
        else
            return null;
    }

    setDate(date){
        this.date.setFullYear(date.getFullYear());
        this.date.setMonth(date.getMonth());
    }

    prevMonth(){
        this.date.setMonth(this.date.getMonth() - 1);
    }

    nextMonth(){
        this.date.setMonth(this.date.getMonth() + 1);
    }

    isValidDate(date = null){
        if (date == null)
            date = this.date;
        return date in this.scheduleTables;
    }

    update(table){
        if (table.children[0] != undefined)
            table.removeChild(table.children[0]);
        let schedule = this.getSchedule(this.date);
        if (this.isValidDate())
            schedule.insertTo(table);
    }
}