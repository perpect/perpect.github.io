// 사람들 정보를 담고 있는 파일
// 사람들의 정보는 객체로 구성되어 있으며, 각 사람의 이름과 생년월일, 전입일, 전화번호, 군번(ID), 기수, 계급을 포함한다.
class Person {
    constructor(name, birthDate, enlistmentDate, phoneNumber, id, batch, rank) {
        this.name = name; // 이름
        this.birthDate = birthDate; // 생년월일
        this.enlistmentDate = enlistmentDate; // 전입일
        this.phoneNumber = phoneNumber; // 전화번호
        this.id = id; // 군번(ID)
        this.batch = batch; // 기수
        this.rank = rank; // 계급
    }

    getInfo() {
        return `이름: ${this.name}, 생년월일: ${this.birthDate}, 전입일: ${this.enlistmentDate}, 전화번호: ${this.phoneNumber}, 군번: ${this.id}, 기수: ${this.batch}, 계급: ${this.rank}`;
    }
}

// PersonManager 클래스는 사람들의 정보를 관리하는 역할을 한다.
class PersonManager {
    constructor() {
        this.people = []; // 사람들의 정보를 담는 배열
    }

    addPerson(person) {
        this.people.push(person); // 사람 추가
    }

    getAllPeople() {
        return this.people; // 모든 사람 정보 반환
    }

    findPersonById(id) {
        return this.people.find(person => person.id === id); // ID로 사람 찾기
    }
}

export { Person, PersonManager };