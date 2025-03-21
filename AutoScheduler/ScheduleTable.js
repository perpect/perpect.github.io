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

class ScheduleTable {
    constructor(peopleInfo = None, dateInfo = None) {
        this.table = document.createElement("table");
        dateInfo.setDate(0);
        this.dayLength = dateInfo.getDate();
        this.tableHead = document.createElement('thead');
        for (let i = 0; i < peopleInfo.length + 1; i++) {
            const newCell = document.createElement('th');
            if (i > 0)
                newCell.insertAdjacentHTML("afterbegin", peopleInfo.getPerson(i - 1).name);
            this.tableHead.append(newCell);
        }
        this.table.append(this.tableHead);
        this.days = [];
        dateInfo.setDate(1);
        let dateCalc = dateInfo.getDay();
        for (let i = 1; i < this.dayLength + 1; i++) {
            const newRow = this.table.insertRow();
            const newCell = newRow.insertCell();
            newCell.insertAdjacentHTML("afterbegin", i);
            if (dateCalc == 0)
                newCell.classList.add("SunColor");
            if (dateCalc == 6)
                newCell.classList.add("SatColor");
            this.days.push(newRow);
            for (let j = 0; j < peopleInfo.length; j++) {
                newRow.insertCell();
            }
            dateCalc = (dateCalc + 1) % 7;
        }
    }

    insertTo(parentElem){
        parentElem.appendChild(this.table);
    }
}