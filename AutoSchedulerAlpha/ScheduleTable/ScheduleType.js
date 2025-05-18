// ScheduleType.js
// ScheduleType.js는 근무의 유형을 정의하는 역할을 한다.
// SchdeuleType은 근무 유형을 정의하는 class로, 근무의 이름, 축약어, 색상, ID, 근무 시간, 근무일 수를 포함한다.
// ScheduleTypeManager는 ScheduleType을 관리하는 역할을 한다.
// ScheduleTypeManager는 ScheduleType을 추가, 삭제, 수정하는 기능을 제공한다.
// ScheduleTypeManager는 ScheduleType을 배열로 관리한다.
// ScheduleTypeManager는 ScheduleType을 ID로 찾는 기능을 제공한다. 이를 위해 Dictionary를 사용한다.
class ScheduleType {
    constructor(id, name, abbreviation, color, workHours, workDays) {
        this.id = id;
        this.name = name;
        this.abbreviation = abbreviation;
        this.color = color;
        this.workHours = workHours;
        this.workDays = workDays;
    }
}

class ScheduleTypeManager {
    constructor() {
        this.scheduleTypes = [];
        this.scheduleTypeDictionary = {};
    }

    addScheduleType(scheduleType) {
        if (this.scheduleTypeDictionary[scheduleType.id]) {
            throw new Error(`ScheduleType with ID ${scheduleType.id} already exists.`);
        }
        this.scheduleTypes.push(scheduleType);
        this.scheduleTypeDictionary[scheduleType.id] = scheduleType;
    }

    removeScheduleType(id) {
        this.scheduleTypes = this.scheduleTypes.filter(type => type.id !== id);
        delete this.scheduleTypeDictionary[id];
    }

    updateScheduleType(id, updatedScheduleType) {
        const index = this.scheduleTypes.findIndex(type => type.id === id);
        if (index === -1) {
            throw new Error(`ScheduleType with ID ${id} does not exist.`);
        }
        this.scheduleTypes[index] = updatedScheduleType;
        this.scheduleTypeDictionary[id] = updatedScheduleType;
    }

    getScheduleTypeById(id) {
        return this.scheduleTypeDictionary[id] || null;
    }
}

export { ScheduleType, ScheduleTypeManager };