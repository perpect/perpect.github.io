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
        this.firstRow = this.table.insertRow();
        this.tableInfo = [[]];
        dateInfo.setDate(1);
        let dateCalc = dateInfo.getDay();
        for (let i = 0; i < this.dayLength + 1; i++) {
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
            for (let j = 0; j < this.dayLength; j++) {
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
}