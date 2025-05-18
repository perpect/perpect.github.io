import { Person, PersonManager } from "./ScheduleTable/Person.js";

// ScheduleTable 클래스는 근무표의 정보을 관리하는 역할을 한다.
// 근무표는 사람(PersonManager)과 날짜 정보로 구성된 일종의 2차원 배열로 구성되어 있으며, ScheduleTable 클래스는 이 배열을 관리하는 역할을 한다.
// 근무표는 각 사람의 근무일에 대한 근무를 포함하고 있으며, 이를 통해 각 사람의 근무일정을 관리할 수 있다.
export class ScheduleTable {
    constructor() {
        this.schedule = []; // 근무표를 담는 배열
        this.personManager = new PersonManager(); // 사람들을 관리하는 PersonManager 객체
    }

    addPerson(person) {
        this.personManager.addPerson(person); // 사람 추가
        this.schedule.push([]); // 근무표에 빈 배열 추가
    }

    addSchedule(date, personId) {
        const personIndex = this.personManager.people.findIndex(person => person.id === personId);
        if (personIndex !== -1) {
            this.schedule[personIndex].push(date); // 해당 사람의 근무일 추가
        }
    }
    getSchedule() {
        return this.schedule; // 근무표 반환
    }
    getAllPeople() {
        return this.personManager.getAllPeople(); // 모든 사람 정보 반환
    }
    findPersonById(id) {
        return this.personManager.findPersonById(id); // ID로 사람 찾기
    }
    getPersonSchedule(personId) {
        const personIndex = this.personManager.people.findIndex(person => person.id === personId);
        if (personIndex !== -1) {
            return this.schedule[personIndex]; // 해당 사람의 근무일 반환
        }
        return null; // 해당 사람이 없을 경우 null 반환
    }
}